# D-Local — Brand Guidelines

Brand identity for D-Local. Scope: brand only. See [positioning.md](./positioning.md) for messaging strategy.

D-Local là sản phẩm thuộc **D-Solutions**. Nhận diện kế thừa hệ thống thiết kế công ty.

## Visual authority
**Nguồn chuẩn (source of truth):** D-Solutions Design System
`/Users/buithucdong/Documents/GitHub/D-Solutions/d-solutions-website/dsolutions-design-system.md`
Không hardcode hex — dùng token. Dưới đây là bản rút gọn cho D-Local.

## Colors
| Vai trò | Màu | Dùng cho |
|---|---|---|
| Primary / CTA | **Yellow #FFD300** (dark #E6BE00) | Nút chính, badge nổi bật |
| Secondary / Dark | **Navy #1E3A8A** (dark #162C6E) | Header/footer tối, text trên vàng |
| Text | Charcoal #1F2937 | Body |
| Neutral | Gray 50–700 | Nền phụ, viền, text phụ |
| Status | success #10B981 · warning #F59E0B · error #EF4444 | Trạng thái |

**Luật màu:** Yellow chỉ đặt text trên nền Navy/Charcoal. CTA = nền vàng + chữ navy. Không dùng chữ vàng trên nền trắng/sáng. Mỗi khối chỉ 1 CTA chính.

## Typography
| Vai trò | Font |
|---|---|
| Heading | **Outfit** (700–900) |
| Body | **DM Sans** (400–600) |
| Code / thuật ngữ | **DM Mono** |

Heading luôn Outfit. Body ≤ 65ch/dòng. Không ALL CAPS cho body. Không dùng Inter/Roboto/Arial.

## Logo
- App icon: `resources/icon.icns` (dùng làm avatar/app mark).
- Trên nền tối/vàng dùng bản tương phản phù hợp; giữ khoảng thở tối thiểu = chiều cao chữ "D".

## Voice & tone
- **Chuyên nghiệp, tin cậy, ngắn gọn.** Câu ≤25 từ (luật brand voice D-Solutions).
- Nói lợi ích cụ thể cho dev, tránh hype. Ví dụ tốt: "Thêm domain, Caddy tự cấu hình."
- Thuật ngữ kỹ thuật (`.local`, `localhost:port`, Caddy, Tailscale) để font mono.

## Do / Don't
- ✅ CTA vàng + chữ navy · ✅ icon Lucide/Heroicons stroke · ✅ token màu.
- ❌ chữ vàng trên trắng · ❌ emoji làm icon UI · ❌ >1 CTA/khối · ❌ purple gradient.

## Cần quyết (unresolved)
- **Lệch màu app vs brand:** UI app D-Local hiện dùng **xanh #3B82F6** (Tailwind blue), chưa khớp vàng/navy D-Solutions. Hướng xử lý:
  1. Giữ app xanh, chỉ marketing (web/landing/social) theo vàng/navy — nhanh, nhưng nhận diện chưa nhất quán.
  2. Chỉnh accent app sang vàng/navy để đồng bộ toàn brand — cần đổi design token trong `globals.css`.
  → Chờ bạn chọn (ngoài scope init lần này; có thể làm sau bằng `/ak-fix` hoặc task riêng).
