"""
阶段 1：将 OpenAPI / Postman / HAR / cURL 解析为统一结构，供单接口调试导入预览。
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qsl, urlparse

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None


def _new_param_row(
    name: str,
    example: str = "",
    desc: str = "",
    typ: str = "string",
) -> Dict[str, Any]:
    return {
        "name": name,
        "type": typ if typ else "string",
        "example": example,
        "desc": desc,
        "enabled": True,
    }


def _openapi_param_to_row(param: Dict[str, Any]) -> Dict[str, Any]:
    """从 OpenAPI 2/3 的 parameter 对象提取一行参数（含类型、示例）。"""
    name = str(param.get("name") or "")
    desc = str(param.get("description") or "").strip()
    typ = "string"
    schema = param.get("schema")
    if isinstance(schema, dict):
        typ = str(schema.get("type") or schema.get("format") or "string")
    elif param.get("type"):
        typ = str(param.get("type"))
    ex = ""
    if "example" in param:
        ex = str(param["example"])
    elif "default" in param:
        ex = str(param["default"])
    elif isinstance(schema, dict):
        ev = _example_from_schema(schema)
        if ev:
            ex = ev if len(ev) < 800 else ev[:800] + "…"
    if param.get("required"):
        desc = f"[必填] {desc}".strip() if desc else "[必填]"
    return _new_param_row(name, ex, desc, typ)


def _body_from_text(mime: Optional[str], text: str) -> Dict[str, Any]:
    if not text or not str(text).strip():
        return {"type": "none", "content": ""}
    m = (mime or "").lower()
    if "json" in m or text.strip().startswith(("{", "[")):
        try:
            parsed = json.loads(text)
            return {"type": "json", "content": json.dumps(parsed, ensure_ascii=False, indent=2)}
        except json.JSONDecodeError:
            return {"type": "text", "content": text}
    return {"type": "text", "content": text}


def _curl_skip_ws(s: str, i: int) -> int:
    n = len(s)
    while i < n and s[i] in " \t\r\n":
        i += 1
    return i


def _curl_read_shell_quoted(s: str, i: int) -> Tuple[str, int]:
    """读取 shell 单引号或双引号串（从 s[i] 的引号字符开始）。双引号内支持 \\ 转义。"""
    n = len(s)
    if i >= n or s[i] not in "'\"":
        return "", i
    quote = s[i]
    i += 1
    buf: List[str] = []
    if quote == "'":
        while i < n:
            if s[i] == "'":
                return "".join(buf), i + 1
            buf.append(s[i])
            i += 1
        return "".join(buf), n
    while i < n:
        if s[i] == "\\" and i + 1 < n:
            buf.append(s[i + 1])
            i += 2
            continue
        if s[i] == '"':
            return "".join(buf), i + 1
        buf.append(s[i])
        i += 1
    return "".join(buf), n


def _curl_read_arg_after_flag(s: str, i: int) -> Tuple[str, int]:
    """-d / -H 等标志后的参数：引号串、@file，或无引号 token（到空白）。"""
    i = _curl_skip_ws(s, i)
    n = len(s)
    if i >= n:
        return "", i
    if s[i] in "'\"":
        return _curl_read_shell_quoted(s, i)
    if s[i] == "@":
        j = i + 1
        while j < n and s[j] not in " \t\r\n":
            j += 1
        return "", j
    j = i
    while j < n and s[j] not in " \t\r\n":
        j += 1
    return s[i:j], j


def _curl_extract_body_payload(s: str) -> str:
    """提取所有 --json / -d / --data* 的负载；优先 JSON 形态。"""
    # 顺序：长选项在前，避免 --data 吃掉 --data-raw
    pat = re.compile(
        r"(?:^|[\s])"
        r"(?:--json|--data-raw|--data-binary|--data-urlencode|--data|-d)"
        r"\s*",
        re.I,
    )
    chunks: List[str] = []
    for m in pat.finditer(s):
        chunk, _ = _curl_read_arg_after_flag(s, m.end())
        chunk = chunk.replace("\\n", "\n")
        if chunk.strip():
            chunks.append(chunk.strip())
    if not chunks:
        return ""
    for c in reversed(chunks):
        t = c.lstrip()
        if t.startswith("{") or t.startswith("["):
            return c
    return chunks[-1]


def _curl_extract_headers(s: str) -> Dict[str, str]:
    """解析 -H / --header 后的引号参数（与 curl 一致）。"""
    headers: Dict[str, str] = {}
    pat = re.compile(r"(?:^|[\s])(?:-H|--header)\s*", re.I)
    for m in pat.finditer(s):
        part, _ = _curl_read_arg_after_flag(s, m.end())
        sep = part.find(":")
        if sep < 0:
            continue
        k = part[:sep].strip()
        v = part[sep + 1 :].strip()
        if k:
            headers[k] = v
    return headers


def _curl_has_json_shorthand(s: str) -> bool:
    return bool(re.search(r"(?:^|[\s])--json\s*", s, re.I))


def _curl_suggests_post(s: str) -> bool:
    """存在 --json / -d / --data*（可与参数紧贴）时视为 POST。"""
    return bool(
        re.search(
            r"(?:^|[\s])(?:--json|--data-raw|--data-binary|--data-urlencode|--data|-d)\s*",
            s,
            re.I,
        )
    )


def parse_curl(raw: str) -> List[Dict[str, Any]]:
    s = raw.strip()
    if not s:
        return []
    # 常见从文档复制的弯引号 → 直引号，避免整段无法解析
    s = (
        s.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
    )
    s = s.lstrip("\ufeff")
    # Unix 反斜杠续行、Windows cmd 的 ^ 续行
    s = re.sub(r"\\\r?\n", " ", s)
    s = re.sub(r"\^\s*\r?\n", " ", s)

    url = ""
    url_m = re.search(r"(?:^|[\s])['\"]?(https?://[^\s'\"]+)['\"]?", s, re.I)
    if url_m:
        url = url_m.group(1).strip("'\"")

    method = "GET"
    m_m = re.search(r"(?:-X|--request)\s+['\"]?(\w+)['\"]?", s, re.I)
    if m_m:
        method = m_m.group(1).upper()

    headers = _curl_extract_headers(s)
    body = _curl_extract_body_payload(s)
    if _curl_has_json_shorthand(s):
        headers.setdefault("Content-Type", "application/json")

    if method == "GET" and _curl_suggests_post(s):
        method = "POST"

    parsed = urlparse(url) if url else None
    path = (parsed.path or "/") if parsed else "/"

    query_params: List[Dict[str, Any]] = []
    header_params: List[Dict[str, Any]] = []

    if parsed and parsed.query:
        for k, v in parse_qsl(parsed.query, keep_blank_values=True):
            query_params.append(_new_param_row(k, v))

    for hk, hv in headers.items():
        header_params.append(_new_param_row(hk, hv))

    ct = headers.get("Content-Type") or headers.get("content-type") or ""
    body_def = _body_from_text(ct, body) if body else {"type": "none", "content": ""}

    name = f"{method} {path}" if path else (url or "cURL 导入")
    return [
        {
            "name": name[:200],
            "method": method,
            "path": path or "/",
            "query_params": query_params,
            "header_params": header_params,
            "path_params": [],
            "body_definition": body_def,
        }
    ]


def _load_json_or_yaml(text: str) -> Any:
    t = text.strip()
    if not t:
        raise ValueError("内容为空")
    if t.startswith("{") or t.startswith("["):
        return json.loads(t)
    if yaml is None:
        raise ValueError("需要 PyYAML 以解析 YAML 格式的 OpenAPI")
    return yaml.safe_load(text)


def _openapi_base_path(spec: Dict[str, Any]) -> str:
    """返回 URL 路径前缀（不含 scheme/host），与单接口调试的 path 字段对齐。"""
    if spec.get("openapi", "").startswith("3"):
        servers = spec.get("servers") or []
        if servers and isinstance(servers[0], dict):
            u = servers[0].get("url") or ""
            p = urlparse(u)
            return (p.path or "").rstrip("/")
    if spec.get("swagger") == "2.0":
        return (spec.get("basePath") or "").rstrip("/") or ""
    return ""


def _merge_parameters(path_item: Dict[str, Any], op: Dict[str, Any]) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []
    seen = set()
    for src in (path_item.get("parameters") or [], op.get("parameters") or []):
        for p in src:
            key = f"{p.get('name')}:{p.get('in')}"
            if key in seen:
                continue
            seen.add(key)
            merged.append(p)
    return merged


def _example_from_schema(schema: Any) -> Optional[str]:
    if schema is None:
        return None
    if isinstance(schema, dict):
        if "example" in schema:
            ex = schema["example"]
            return json.dumps(ex, ensure_ascii=False) if not isinstance(ex, str) else ex
        if "default" in schema:
            return json.dumps(schema["default"], ensure_ascii=False)
        typ = schema.get("type")
        if typ == "object" and schema.get("properties"):
            obj = {}
            for k, v in schema["properties"].items():
                ex = _example_from_schema(v)
                if ex:
                    try:
                        obj[k] = json.loads(ex)
                    except json.JSONDecodeError:
                        obj[k] = ex
            return json.dumps(obj, ensure_ascii=False) if obj else None
        if typ == "array" and schema.get("items"):
            inner = _example_from_schema(schema["items"])
            if inner:
                try:
                    return json.dumps([json.loads(inner)], ensure_ascii=False)
                except json.JSONDecodeError:
                    return json.dumps([inner], ensure_ascii=False)
    return None


def _body_from_oas_request_body(rb: Any) -> Dict[str, Any]:
    """OpenAPI 3 requestBody：尽量还原 JSON / 表单 / multipart / XML 等。"""
    if not rb:
        return {"type": "none", "content": ""}
    content = rb.get("content") if isinstance(rb, dict) else {}
    if not content:
        return {"type": "none", "content": ""}

    def _try_json_block(block: Any) -> Optional[Dict[str, Any]]:
        if not isinstance(block, dict):
            return None
        if "example" in block:
            ex = block["example"]
            return {
                "type": "json",
                "content": json.dumps(ex, ensure_ascii=False, indent=2)
                if not isinstance(ex, str)
                else ex,
            }
        schema = block.get("schema")
        if schema:
            exs = _example_from_schema(schema)
            if exs:
                return {"type": "json", "content": exs}
        return {"type": "json", "content": "{}"}

    for mime, block in content.items():
        if not isinstance(mime, str):
            continue
        ml = mime.lower()
        if "json" in ml or ml.endswith("+json"):
            got = _try_json_block(block)
            if got:
                return got

    for mime, block in content.items():
        if not isinstance(mime, str) or "x-www-form-urlencoded" not in mime.lower():
            continue
        if isinstance(block, dict) and isinstance(block.get("schema"), dict):
            sch = block["schema"]
            props = sch.get("properties") or {}
            parts = []
            for k, v in props.items():
                ex = _example_from_schema(v) or ""
                parts.append(f"{k}={ex}")
            if parts:
                return {"type": "x-www-form-urlencoded", "content": "&".join(parts)}

    for mime, block in content.items():
        if not isinstance(mime, str) or "multipart" not in mime.lower():
            continue
        if isinstance(block, dict) and isinstance(block.get("schema"), dict):
            sch = block["schema"]
            props = sch.get("properties") or {}
            lines = []
            for k, v in props.items():
                ex = _example_from_schema(v) or ""
                lines.append(f"{k}={ex}")
            if lines:
                return {"type": "form-data", "content": "\n".join(lines)}

    for mime, block in content.items():
        if not isinstance(mime, str) or "xml" not in mime.lower():
            continue
        if isinstance(block, dict) and "example" in block:
            return {"type": "xml", "content": str(block["example"])}

    for mime, block in content.items():
        if isinstance(block, dict) and "example" in block:
            return _body_from_text(mime, str(block["example"]))
    return {"type": "none", "content": ""}


def _swagger2_formdata_body(params: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Swagger 2 formData 参数 → urlencoded 文本。"""
    parts: List[str] = []
    for p in params:
        if not isinstance(p, dict) or p.get("in") != "formData":
            continue
        name = str(p.get("name") or "")
        if not name:
            continue
        schema = p.get("schema")
        if isinstance(schema, dict):
            ex = _example_from_schema(schema) or ""
        else:
            ex = str(p.get("example") or p.get("default") or "")
        parts.append(f"{name}={ex}")
    if not parts:
        return {"type": "none", "content": ""}
    return {"type": "x-www-form-urlencoded", "content": "&".join(parts)}


def _resolve_json_pointer(doc: Any, pointer: str) -> Any:
    """解析 JSON 文档内 #/components/pathItems/Foo 等指针（RFC6901 基础实现）。"""
    if not isinstance(pointer, str) or not pointer.startswith("#/"):
        return None
    parts = pointer[2:].split("/")
    cur: Any = doc
    for raw in parts:
        key = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, list):
            try:
                idx = int(key)
                cur = cur[idx]
            except (ValueError, IndexError, TypeError):
                return None
        elif isinstance(cur, dict):
            if key not in cur:
                return None
            cur = cur[key]
        else:
            return None
    return cur


def _flatten_path_item_allof(spec: Dict[str, Any], path_item: Dict[str, Any]) -> Dict[str, Any]:
    """合并 path item 上的 allOf（多段 $ref 组合）。"""
    allof = path_item.get("allOf")
    if not isinstance(allof, list) or not allof:
        return path_item
    merged: Dict[str, Any] = {}
    for part in allof:
        if not isinstance(part, dict):
            continue
        ref = part.get("$ref")
        if isinstance(ref, str) and ref.startswith("#/"):
            r = _resolve_json_pointer(spec, ref)
            if isinstance(r, dict):
                merged.update(r)
        else:
            merged.update(part)
    out = dict(merged)
    for k, v in path_item.items():
        if k != "allOf":
            out[k] = v
    return out


def _resolve_openapi_path_item(spec: Dict[str, Any], path_item: Any) -> Dict[str, Any]:
    """
    展开 paths 下 path item 的 $ref（支持多跳链式引用）。
    Apifox/Knife4j 常把定义放在 components/pathItems、definitions 等，paths 里仅 $ref；
    单层解析失败或只解一半时，会表现为「只剩 1 条有内联方法的 path」。
    """
    if not isinstance(path_item, dict):
        return {}
    cur = _flatten_path_item_allof(spec, path_item)
    for _ in range(32):
        if not isinstance(cur, dict):
            return {}
        ref = cur.get("$ref")
        if not isinstance(ref, str) or not ref.startswith("#/"):
            return cur
        resolved = _resolve_json_pointer(spec, ref)
        if not isinstance(resolved, dict):
            return cur
        merged = dict(resolved)
        for k, v in cur.items():
            if k != "$ref":
                merged[k] = v
        cur = merged
    return cur


def _resolve_openapi_operation(spec: Dict[str, Any], op: Any) -> Optional[Dict[str, Any]]:
    """展开 operation 上的 $ref（支持多跳）。"""
    if not isinstance(op, dict):
        return None
    cur: Dict[str, Any] = dict(op)
    for _ in range(32):
        ref = cur.get("$ref")
        if not isinstance(ref, str) or not ref.startswith("#/"):
            return cur
        resolved = _resolve_json_pointer(spec, ref)
        if not isinstance(resolved, dict):
            return cur
        merged = dict(resolved)
        for k, v in cur.items():
            if k != "$ref":
                merged[k] = v
        cur = merged
    return cur


def _scan_best_openapi_spec(node: Any, depth: int = 0) -> Tuple[Optional[Dict[str, Any]], int]:
    """深度扫描 JSON，找出「含 openapi/swagger + paths」且 paths 键最多的对象（应对套壳导出）。"""
    best_d: Optional[Dict[str, Any]] = None
    best_n = -1
    if depth > 14:
        return None, -1
    if isinstance(node, dict):
        p = node.get("paths")
        if isinstance(p, dict) and (node.get("openapi") or node.get("swagger")):
            n = len(p)
            if n > best_n:
                best_n = n
                best_d = node
        for v in node.values():
            d, n = _scan_best_openapi_spec(v, depth + 1)
            if n > best_n:
                best_n, best_d = n, d
    elif isinstance(node, list):
        for it in node:
            d, n = _scan_best_openapi_spec(it, depth + 1)
            if n > best_n:
                best_n, best_d = n, d
    return best_d, best_n


def _is_openapi_like(d: Dict[str, Any]) -> bool:
    return bool(d.get("openapi") or d.get("swagger")) and isinstance(d.get("paths"), dict)


def _merge_openapi_path_items(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    """合并同一 path 下的 path item（含多 HTTP 方法）；用于 x-ms-paths 与 paths 重叠时。"""
    http_methods = ("get", "post", "put", "delete", "patch", "head", "options", "trace")
    out = dict(a)
    for k, v in b.items():
        if k in out and k in http_methods and isinstance(out[k], dict) and isinstance(v, dict):
            merged = dict(out[k])
            merged.update(v)
            out[k] = merged
        elif k not in out:
            out[k] = v
    return out


def _unwrap_openapi_document(raw: Any) -> Dict[str, Any]:
    """
    部分平台把完整 OpenAPI 包在 data/result/openapiSpec 等字段里；
    若顶层误带了一个「只有 1 条 path」的壳而真实规范在嵌套里，选 paths 键最多的那份。
    """
    if not isinstance(raw, dict):
        return {}

    candidates: List[Dict[str, Any]] = []
    if _is_openapi_like(raw):
        candidates.append(raw)

    nested_keys = (
        "data",
        "result",
        "body",
        "openapiSpec",
        "swaggerDoc",
        "doc",
        "spec",
        "openapi",
        "content",
        "payload",
    )
    for key in nested_keys:
        inner = raw.get(key)
        if isinstance(inner, dict) and _is_openapi_like(inner):
            candidates.append(inner)
        if isinstance(inner, str):
            try:
                parsed = json.loads(inner)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict) and _is_openapi_like(parsed):
                candidates.append(parsed)

    scanned, _ = _scan_best_openapi_spec(raw)
    if scanned is not None:
        candidates.append(scanned)

    if candidates:
        return max(candidates, key=lambda d: len(d.get("paths") or {}))

    return raw


def _is_openapi3(spec: Dict[str, Any]) -> bool:
    v = spec.get("openapi")
    if v is None:
        return False
    return str(v).strip().startswith("3")


def _emit_openapi_operations_for_path(
    spec: Dict[str, Any],
    base: str,
    pth: str,
    path_item: Dict[str, Any],
    out: List[Dict[str, Any]],
    used_titles: Dict[str, int],
) -> None:
    http_methods = ("get", "post", "put", "delete", "patch", "head", "options", "trace")
    for method in http_methods:
        raw_op = path_item.get(method)
        op = _resolve_openapi_operation(spec, raw_op)
        if not isinstance(op, dict):
            continue

        m = method.upper()
        params = _merge_parameters(path_item, op)
        query_params: List[Dict[str, Any]] = []
        header_params: List[Dict[str, Any]] = []
        path_params: List[Dict[str, Any]] = []

        for param in params:
            if not isinstance(param, dict):
                continue
            pin = param.get("in")
            row = _openapi_param_to_row(param)
            if pin == "query":
                query_params.append(row)
            elif pin == "header":
                header_params.append(row)
            elif pin == "path":
                pd = row.get("desc") or ""
                row["desc"] = f"[路径参数] {pd}".strip()
                path_params.append(row)

        body_def: Dict[str, Any] = {"type": "none", "content": ""}
        if _is_openapi3(spec):
            body_def = _body_from_oas_request_body(op.get("requestBody"))
        elif spec.get("swagger") == "2.0":
            form_params = [p for p in params if isinstance(p, dict) and p.get("in") == "formData"]
            body_params = [p for p in params if isinstance(p, dict) and p.get("in") == "body"]
            if form_params:
                body_def = _swagger2_formdata_body(form_params)
            elif body_params:
                schema = body_params[0].get("schema")
                exs = _example_from_schema(schema)
                if exs:
                    body_def = {"type": "json", "content": exs}

        full_path = f"{base}{pth}" if base else (pth or "/")
        title = op.get("summary") or op.get("operationId") or f"{m} {full_path}"
        title_str = str(title)[:255]
        n = used_titles.get(title_str, 0)
        used_titles[title_str] = n + 1
        if n > 0:
            title_str = f"{title_str} ({n})"[:255]

        out.append(
            {
                "name": title_str,
                "method": m,
                "path": full_path,
                "query_params": query_params,
                "header_params": header_params,
                "path_params": path_params,
                "body_definition": body_def,
            }
        )


def parse_openapi(text: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    raw = _load_json_or_yaml(text)
    if not isinstance(raw, dict):
        raise ValueError("OpenAPI 根节点须为对象")

    spec = _unwrap_openapi_document(raw)
    if not isinstance(spec, dict):
        raise ValueError("OpenAPI 根节点须为对象")

    raw_paths = spec.get("paths")
    if raw_paths is None:
        paths: Dict[str, Any] = {}
    elif not isinstance(raw_paths, dict):
        raise ValueError("无效的 OpenAPI：paths 须为对象")
    else:
        paths = dict(raw_paths)

    xms = spec.get("x-ms-paths")
    if isinstance(xms, dict):
        for k, v in xms.items():
            if k in paths and isinstance(paths[k], dict) and isinstance(v, dict):
                paths[k] = _merge_openapi_path_items(paths[k], v)
            else:
                paths[k] = v

    path_keys = list(paths.keys())
    meta: Dict[str, Any] = {
        "paths_key_count": len(path_keys),
        "paths_keys_sample": path_keys[:80],
        "openapi_version": str(spec.get("openapi") or spec.get("swagger") or ""),
    }

    base = _openapi_base_path(spec)
    out: List[Dict[str, Any]] = []
    used_titles: Dict[str, int] = {}

    for pth, raw_path_item in paths.items():
        path_item = _resolve_openapi_path_item(spec, raw_path_item)
        if not path_item:
            continue
        _emit_openapi_operations_for_path(spec, base, pth, path_item, out, used_titles)

    webhooks = spec.get("webhooks")
    if isinstance(webhooks, dict):
        for wh_name, raw_wh in webhooks.items():
            wh_item = _resolve_openapi_path_item(spec, raw_wh)
            if not wh_item:
                continue
            synth_path = f"/webhooks/{wh_name}"
            _emit_openapi_operations_for_path(spec, base, synth_path, wh_item, out, used_titles)

    meta["operations_parsed"] = len(out)
    if not out:
        raise ValueError("未从 OpenAPI 中解析到任何 HTTP 操作")
    return out, meta


def _postman_url_to_parts(url: Any) -> tuple[str, List[Dict[str, Any]]]:
    query_params: List[Dict[str, Any]] = []
    if isinstance(url, str):
        parsed = urlparse(url)
        path = parsed.path or "/"
        if parsed.query:
            for k, v in parse_qsl(parsed.query, keep_blank_values=True):
                query_params.append(_new_param_row(k, v))
        return path, query_params

    if isinstance(url, dict):
        raw = url.get("raw") or ""
        qlist = url.get("query") or []
        if isinstance(qlist, list):
            for q in qlist:
                if isinstance(q, dict) and q.get("key") is not None:
                    query_params.append(
                        _new_param_row(str(q.get("key")), str(q.get("value") or ""))
                    )
        path_parts = url.get("path")
        if isinstance(path_parts, list):
            path = "/" + "/".join(str(p) for p in path_parts if p is not None)
            return path or "/", query_params
        if raw:
            parsed = urlparse(raw)
            path = parsed.path or "/"
            if parsed.query and not query_params:
                for k, v in parse_qsl(parsed.query, keep_blank_values=True):
                    query_params.append(_new_param_row(k, v))
            return path, query_params

    return "/", []


def _postman_headers(hlist: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if not isinstance(hlist, list):
        return out
    for h in hlist:
        if isinstance(h, dict) and h.get("key"):
            if h.get("disabled") is True:
                continue
            out.append(_new_param_row(str(h["key"]), str(h.get("value") or "")))
    return out


def _postman_body(body: Any) -> Dict[str, Any]:
    if not isinstance(body, dict):
        return {"type": "none", "content": ""}
    mode = (body.get("mode") or "raw").lower()
    if mode == "raw":
        raw = body.get("raw") or ""
        opts = body.get("options") or {}
        lang = ""
        if isinstance(opts, dict):
            raw_opts = opts.get("raw") or {}
            if isinstance(raw_opts, dict):
                lang = (raw_opts.get("language") or "").lower()
        if lang == "json" or str(raw).strip().startswith(("{", "[")):
            return _body_from_text("application/json", str(raw))
        return _body_from_text("text/plain", str(raw))
    if mode in ("urlencoded", "x-www-form-urlencoded"):
        ud = body.get("urlencoded") or []
        parts = []
        if isinstance(ud, list):
            for p in ud:
                if isinstance(p, dict) and p.get("key"):
                    parts.append(f'{p["key"]}={p.get("value") or ""}')
        text = "&".join(parts)
        return {"type": "x-www-form-urlencoded", "content": text}
    if mode == "formdata":
        fd = body.get("formdata") or []
        lines: List[str] = []
        if isinstance(fd, list):
            for p in fd:
                if not isinstance(p, dict) or not p.get("key"):
                    continue
                k = str(p.get("key"))
                if str(p.get("type") or "").lower() == "file":
                    src = str(p.get("src") or p.get("value") or "")
                    lines.append(f"{k}=@file:{src}")
                else:
                    lines.append(f'{k}={p.get("value") or ""}')
        text = "\n".join(lines)
        if text:
            return {"type": "form-data", "content": text}
    if mode == "graphql":
        q = body.get("graphql") or {}
        if isinstance(q, dict):
            query = q.get("query") or ""
            variables = q.get("variables") or ""
            payload = json.dumps(
                {"query": query, "variables": variables},
                ensure_ascii=False,
                indent=2,
            )
            return {"type": "json", "content": payload}
    return {"type": "none", "content": ""}


def _walk_postman_items(items: Any, prefix: str, out: List[Dict[str, Any]]) -> None:
    if not isinstance(items, list):
        return
    for it in items:
        if not isinstance(it, dict):
            continue
        name = str(it.get("name") or "请求")
        full_name = f"{prefix}{name}" if prefix else name
        if it.get("item"):
            _walk_postman_items(it["item"], full_name + " / ", out)
        req = it.get("request")
        if isinstance(req, str):
            path, query_params = _postman_url_to_parts(req)
            out.append(
                {
                    "name": full_name[:255],
                    "method": "GET",
                    "path": path or "/",
                    "query_params": query_params,
                    "header_params": [],
                    "path_params": [],
                    "body_definition": {"type": "none", "content": ""},
                }
            )
        elif isinstance(req, dict):
            method = str(req.get("method") or "GET").upper()
            path, query_params = _postman_url_to_parts(req.get("url"))
            headers = _postman_headers(req.get("header"))
            body_def = _postman_body(req.get("body"))
            out.append(
                {
                    "name": full_name[:255],
                    "method": method,
                    "path": path or "/",
                    "query_params": query_params,
                    "header_params": headers,
                    "path_params": [],
                    "body_definition": body_def,
                }
            )


def parse_postman(text: str) -> List[Dict[str, Any]]:
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Postman Collection 须为 JSON 对象")
    out: List[Dict[str, Any]] = []
    _walk_postman_items(data.get("item"), "", out)
    if not out:
        raise ValueError("未从 Postman 集合中解析到任何请求")
    return out


def parse_har(text: str) -> List[Dict[str, Any]]:
    data = json.loads(text)
    log = data.get("log") if isinstance(data, dict) else None
    entries = log.get("entries") if isinstance(log, dict) else None
    if not isinstance(entries, list):
        raise ValueError("无效的 HAR：缺少 log.entries")

    out: List[Dict[str, Any]] = []
    for i, ent in enumerate(entries):
        if not isinstance(ent, dict):
            continue
        req = ent.get("request")
        if not isinstance(req, dict):
            continue
        method = str(req.get("method") or "GET").upper()
        url_s = req.get("url")
        if isinstance(url_s, dict):
            url_s = url_s.get("raw") or ""
        url_s = str(url_s or "")
        parsed = urlparse(url_s)
        path = parsed.path or "/"
        query_params: List[Dict[str, Any]] = []
        if parsed.query:
            for k, v in parse_qsl(parsed.query, keep_blank_values=True):
                query_params.append(_new_param_row(k, v))

        header_params: List[Dict[str, Any]] = []
        for h in req.get("headers") or []:
            if isinstance(h, dict) and h.get("name"):
                n = str(h["name"])
                if n.lower().startswith(":"):
                    continue
                header_params.append(_new_param_row(n, str(h.get("value") or "")))

        body_def = {"type": "none", "content": ""}
        pd = req.get("postData")
        if isinstance(pd, dict):
            mime = pd.get("mimeType") or ""
            text = pd.get("text") or ""
            params = pd.get("params")
            if isinstance(params, list) and params:
                parts = []
                for p in params:
                    if isinstance(p, dict) and p.get("name") is not None:
                        parts.append(f'{p["name"]}={p.get("value") or ""}')
                body_def = {"type": "text", "content": "&".join(parts)}
            else:
                body_def = _body_from_text(mime, str(text))

        name = f"{method} {path}"
        if len(entries) > 1:
            name = f"{name} (#{i + 1})"
        out.append(
            {
                "name": name[:255],
                "method": method,
                "path": path,
                "query_params": query_params,
                "header_params": header_params,
                "path_params": [],
                "body_definition": body_def,
            }
        )

    if not out:
        raise ValueError("HAR 中没有任何请求条目")
    return out


def parse_import(format_id: str, content: str) -> Dict[str, Any]:
    fmt = (format_id or "").strip().lower()
    meta: Dict[str, Any] = {}
    if fmt in ("openapi", "swagger", "openapi3", "openapi2"):
        items, meta = parse_openapi(content)
    elif fmt in ("postman", "postman_collection"):
        items = parse_postman(content)
    elif fmt == "har":
        items = parse_har(content)
    elif fmt in ("curl", "shell_curl"):
        items = parse_curl(content)
    else:
        raise ValueError(f"不支持的导入格式: {format_id}")

    return {"format": fmt, "count": len(items), "items": items, "meta": meta}
