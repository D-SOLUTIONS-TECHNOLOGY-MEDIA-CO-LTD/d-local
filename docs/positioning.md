# D-Local — Positioning

Product marketing positioning. Owner doc for target, value prop, messaging.
Scope: positioning only. See [brand-guidelines.md](./brand-guidelines.md) for identity.

## One-liner
D-Local biến `localhost:port` thành domain `.local` gọn đẹp — và mở được cả trên điện thoại.

## Target audience
Chính: **agency & freelancer dev trên macOS** chạy nhiều project song song.
Phụ: web/full-stack dev, team nhỏ cần chuẩn hoá local domain.

## Problem
- Gõ/nhớ `localhost:3000`, `:3001`, `:3231`… rối khi nhiều project.
- Sửa `/etc/hosts` + reverse proxy thủ công tốn thời gian, dễ sai.
- Khó demo bản dev cho client hoặc xem trên điện thoại.

## Value proposition — 3 trụ
1. **Đơn giản** — GUI 1 click, không đụng `/etc/hosts` hay Caddyfile bằng tay.
2. **Truy cập từ điện thoại** — Tailscale + QR, demo cho client tức thì, không deploy.
3. **Miễn phí & mã nguồn mở** — MIT, minh bạch, không khoá tính năng.

## Positioning statement
Cho **agency/freelancer dev macOS** chạy nhiều project, **D-Local** là **app quản lý local domain** giúp truy cập `project.local` (và mở trên điện thoại qua Tailscale) chỉ với vài click — khác với chỉnh hosts thủ công hay công cụ chỉ chạy cục bộ.

## Competitive landscape
| Đối thủ | Điểm mạnh họ | Khác biệt của D-Local |
|---|---|---|
| Local (WP Engine) | Trọn bộ WordPress | Nhẹ, mọi stack, không khoá WP |
| Laravel Herd/Valet | Tối ưu PHP/Laravel | Không phụ thuộc ngôn ngữ; GUI trực quan |
| ngrok | Tunnel công khai | Riêng tư qua tailnet, không lộ Internet, miễn phí |
| SwitchHosts / Gas Mask | Sửa hosts | Kèm reverse proxy Caddy + truy cập điện thoại |

## Messaging pillars (proof point)
- **Gọn** — 1 click thêm domain, Caddy tự cấu hình. (auto hosts + Caddyfile)
- **Di động** — QR mở app dev trên điện thoại qua tailnet. (Tailscale Serve, không đụng 443)
- **Tin cậy** — tự chẩn lỗi cổng, đèn sức khoẻ, nút Repair. (self-diagnostics)
- **Mở** — MIT, GitHub, build `.dmg` universal.

## Tone
Chuyên nghiệp, tin cậy, ngắn gọn. Câu ≤25 từ. Thuật ngữ kỹ thuật dùng font mono.

## Primary CTA angle
"Tải D-Local — chạy `project.local` trong 30 giây." (open-source, macOS)

## Unresolved
- Kênh phát hành chính (Product Hunt / GitHub / cộng đồng dev VN)? — chưa chốt (ngoài scope lần này).
