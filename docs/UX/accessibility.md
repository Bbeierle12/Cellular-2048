# Accessibility Guide

## Overview
Cellular 2048 is designed to be accessible to all users, following WCAG 2.1 Level AA guidelines.

## Implemented Features

### Semantic HTML & ARIA
- **Landmark roles**: `main`, `banner`, `complementary`, `region`, `application`
- **ARIA labels**: All interactive elements have descriptive labels
- **ARIA live regions**: Score updates and game state changes are announced
- **Alert roles**: Win/lose conditions use `role="alert"` with `aria-live="assertive"`

### Keyboard Navigation
- **Arrow keys**: Navigate and swipe in all directions (Up, Down, Left, Right)
- **WASD keys**: Alternative control scheme for swipes
- **R key**: Reset the game
- **G key**: Toggle Life preview overlay
- **Tab key**: Focus management through interactive elements
- **Visual focus indicators**: Clear outline on focused game board

### Screen Reader Support
- **Score updates**: Live region announces score changes
- **Game state**: Energy ring, turn count, and multiplier are announced
- **Ghost preview**: Describes predicted births and deaths
- **Grid description**: Canvas provides alt text with grid dimensions
- **Status alerts**: Win and game over states are announced assertively

### Visual Accessibility
- **High contrast mode**: Enhanced colors when system prefers high contrast
- **Focus indicators**: 3px blue outline with proper contrast on focus
- **Color independence**: Information not conveyed by color alone
- **Text contrast**: All text meets WCAG AA standards (4.5:1 minimum)

### Motion Accessibility
- **Reduced motion**: Respects `prefers-reduced-motion` system setting
- **No essential animations**: All animations are decorative only
- **Toggleable preview**: Ghost preview can be turned off

## Testing Checklist

### Keyboard Navigation
- [x] Can navigate to game board with Tab
- [x] Can play game entirely with keyboard (arrows/WASD)
- [x] Can reset game with R key
- [x] Can toggle preview with G key
- [x] Focus indicator is visible and clear

### Screen Reader
- [x] Page title is announced
- [x] Landmark regions are properly labeled
- [x] Score changes are announced
- [x] Game state changes are announced (win/lose)
- [x] Interactive elements have descriptive labels
- [x] Canvas has proper alt text

### Visual
- [x] Text has sufficient contrast (4.5:1 minimum)
- [x] Focus indicators are visible
- [x] High contrast mode is supported
- [x] Information is not conveyed by color alone

### Motion
- [x] Animations respect reduced motion preference
- [x] No flashing content above 3Hz
- [x] Animations can be disabled

## Browser/AT Compatibility

### Tested With
- **NVDA** (Windows): Full functionality
- **JAWS** (Windows): Full functionality  
- **Narrator** (Windows): Full functionality
- **VoiceOver** (macOS/iOS): Full functionality
- **TalkBack** (Android): Touch gestures work

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations
- Canvas rendering is not directly accessible; described via ARIA labels
- Touch swipe gestures may conflict with screen reader gestures
- Ghost preview SVG animations may not announce individual cell changes

## Future Improvements
- [ ] Add sound effects with audio descriptions
- [ ] Implement alternative text-based game mode
- [ ] Add customizable color themes
- [ ] Improve touch gesture documentation
- [ ] Add haptic feedback for mobile devices

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

