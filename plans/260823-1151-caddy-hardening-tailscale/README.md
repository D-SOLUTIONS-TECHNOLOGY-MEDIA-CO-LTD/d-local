# D-Local: Caddy hardening + Tailscale remote access

Status: done (A+B+C, reviewed, committed, packaged) · Branch: feat/caddy-http-hardening-tailscale · Owner: session
Commit: a0fc261 · Artifact: dist/D-Local-1.0.0-universal.dmg (unsigned). Not pushed.
Verify: typecheck:main/renderer clean; lint 0 errors (pre-existing `any` warnings); `pnpm build` OK; caddy HTTP :80 → 307; tailscale serve/off validated (443 mapping untouched).

## Outcome
D-Local ổn định (không im lặng chết), tiện dùng hằng ngày, và cho phép truy cập
dev server từ điện thoại qua Tailscale — không xung đột cổng 443 của Tailscale Serve.

## Constraints
- Không chiếm cổng 443 (Tailscale Serve dùng). Caddy phục vụ HTTP cổng 80 (đã fix).
- Không phá Tailscale Serve `/`→8787 hiện có (dùng serve theo **cổng riêng**, không đụng path `/` 443).
- macOS, Electron, bản đóng gói. Domain iface `Domain` nhân đôi main↔renderer (giữ đồng bộ).

## Non-goals
- Không thay Caddy. Không bật Tailscale Funnel (công khai Internet). Không auto-nhảy cổng ngầm.

## Phases

### A — Robustness (self-diagnose)
- `config.ts`: thêm `httpPort` (default 80).
- `caddy.ts`: Caddyfile dùng `http://name.local[:port]`; lưu `lastError`; pre-flight kiểm tra chủ cổng (lsof) → nếu bị chiếm bởi tiến trình khác caddy thì báo lỗi rõ.
- `getCaddyStatus` trả thêm `httpPort`, `lastError`, `portConflict`.
- StatusBar hiện lỗi + tiến trình đang giữ cổng.
- Acceptance: :80 bị chiếm → UI đỏ + tên tiến trình, không im lặng.

### B — Convenience
- Auto-start Caddy khi mở app (index.ts) nếu đã cài + có domain.
- DomainCard: đèn 3 màu (xanh=proxy+backend OK, vàng=backend chưa chạy/502, đỏ=Caddy chết) + tooltip.
- StatusBar: nút "Repair" → đồng bộ hosts + regenerate Caddyfile + start/reload (1 click).
- Acceptance: tắt dev server → domain vàng; bấm Repair → mọi thứ xanh.

### C — Tailscale remote (điện thoại)
- `tailscale.ts` mới: status (dnsName), serve(id)/unserve(id) theo cổng riêng (10000+), map tailnet:port → 127.0.0.1:domain.port.
- Domain thêm `tailscaleServe?`, `tailscalePort?`.
- ipc + `store/tailscale.ts` + DomainCard: toggle "Mở cho thiết bị của tôi" + URL + QR (`qrcode`).
- Acceptance: bật toggle → quét QR trên điện thoại (cùng tailnet) → mở được app; không ảnh hưởng serve 443 sẵn có.

## Verify
- `pnpm typecheck` + `pnpm lint` sau mỗi phase. Kiểm thử thủ công caddy start/serve trên máy.

## Unresolved
- Tailscale serve theo **path** vs **port**: chọn port (sạch cho mọi app, URL có cổng).
