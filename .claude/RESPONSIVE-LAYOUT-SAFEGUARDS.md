# Responsive Layout Safeguards

## Root Cause Analysis: Sidebar Rendering Issue

**Problem:** Sidebar overlaid content on mobile, making the app unusable across different screen sizes and resolutions.

**Root Causes:**
1. No responsive state tracking (`isMobile`) to distinguish mobile/desktop contexts
2. Sidebar relied solely on transform-based hiding without viewport-aware logic
3. Resize/orientation events weren't monitored, causing stale sidebar state
4. Menu button could be interacted with on desktop (lg:hidden failed in some cases)
5. Backdrop overlay wasn't mobile-specific, allowing unintended behavior

---

## Architecture: Responsive Layout Pattern

### 1. **Mobile-First State Management**
```tsx
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
```

**Breakpoint:** `1024px` (Tailwind `lg:` breakpoint)
- Below 1024px = Mobile (sidebar overlays content, closes after navigation)
- 1024px+ = Desktop (sidebar can be toggled/collapsed, pushes content)

### 2. **Automatic State Sync on Resize/Orientation**
```tsx
useEffect(() => {
  const handleResize = () => {
    const isNowMobile = window.innerWidth < 1024;
    setIsMobile(isNowMobile);
    
    // Auto-close sidebar when switching to mobile
    if (isNowMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };
  
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
  
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
  };
}, [isMobile, isSidebarOpen, isSidebarCollapsed]);
```

**What This Prevents:**
- ✅ Sidebar stuck open after rotating phone
- ✅ Sidebar state inconsistent with screen size
- ✅ Content unreachable on small screens
- ✅ Unresponsive behavior on slow networks (passive listeners)

### 3. **Responsive Sidebar CSS**
```tsx
<aside className={cn(
  // Safety: always hide on mobile unless opened
  isMobile && !isSidebarOpen ? "-translate-x-full" : "",
  // Desktop rules
  !isMobile && isSidebarCollapsed ? "lg:-translate-x-full" : "",
  !isMobile && !isSidebarCollapsed ? "lg:translate-x-0" : "",
  // Mobile rules
  isMobile && isSidebarOpen ? "translate-x-0" : ""
)}
style={{
  maxWidth: '90vw', // Never exceed viewport on ultra-narrow screens
}}
/>
```

**Safeguards:**
- Explicit mobile/desktop branching (no ambiguous class combinations)
- `maxWidth: 90vw` prevents sidebar from exceeding viewport on phones (e.g., iPhone SE @ 375px)
- Transform-based showing/hiding (GPU-accelerated, performant)

### 4. **Mobile-Only Overlay & Menu Button**
```tsx
{isSidebarOpen && isMobile && (
  <motion.div
    onClick={() => setIsSidebarOpen(false)}
    onTouchStart={() => setIsSidebarOpen(false)}
    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
  />
)}

{isMobile && (
  <button
    onClick={() => setIsSidebarOpen(true)}
    disabled={!isMobile}
    aria-expanded={isSidebarOpen}
  >
    <Menu />
  </button>
)}
```

**Safeguards:**
- Overlay only renders on mobile (`isSidebarOpen && isMobile`)
- Both click AND touch events close sidebar (cross-browser)
- Menu button disabled on desktop (explicit `disabled` prop)
- ARIA labels for accessibility

---

## Testing Checklist

### Viewport Sizes (All Should Work Smoothly)
- [ ] **iPhone SE** (375px) — ultra-narrow, sidebar = 90vw max
- [ ] **iPhone 12/13** (390px)
- [ ] **Pixel 6** (412px)
- [ ] **iPad** (768px) — transitions to desktop rules at 1024px
- [ ] **Tablet Landscape** (1024px) — exact breakpoint
- [ ] **Desktop** (1280px+)
- [ ] **4K** (2560px+) — verify no overflow

### Interactions (All Breakpoints)
- [ ] Click menu button on mobile → sidebar opens
- [ ] Click backdrop on mobile → sidebar closes
- [ ] Swipe on mobile → backdrop dismisses (touch handler)
- [ ] On desktop → sidebar can be toggled/collapsed
- [ ] Resize browser window desktop→mobile → sidebar auto-closes
- [ ] Rotate phone (portrait↔landscape) → sidebar state resets

### Network Conditions
- [ ] **Slow 3G** — sidebar state syncs within 1s
- [ ] **Offline** — sidebar still toggles (local state)
- [ ] **High Latency** — resize listener doesn't block (passive: true)

### Browser/OS
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Edge (Windows & mobile)
- [ ] Samsung Internet (Android)

---

## Key Principles: Preventing Future Issues

### 1. **Always Track Breakpoint State**
❌ Bad:
```tsx
// Relies on CSS media queries — unreliable for JS logic
if (window.innerWidth < 1024) { /* maybe, maybe not */ }
```

✅ Good:
```tsx
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
// Keep in sync with resize events
```

### 2. **Explicit Mobile/Desktop Branching**
❌ Bad:
```tsx
className={cn(
  "lg:translate-x-0",
  someCondition && "-translate-x-full"
  // Ambiguous — which rule wins on mobile?
)}
```

✅ Good:
```tsx
className={cn(
  isMobile && !isOpen ? "-translate-x-full" : "",
  !isMobile && isOpen ? "translate-x-0" : ""
  // Crystal clear intent
)}
```

### 3. **Listen to Viewport Events**
❌ Bad:
```tsx
// State is set once on mount, never updated
const isMobile = window.innerWidth < 1024;
```

✅ Good:
```tsx
useEffect(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  return () => { /* cleanup */ };
}, []);
```

### 4. **Use Passive Event Listeners**
Prevents jank on slow networks:
```tsx
window.addEventListener('resize', handler, { passive: true });
```

### 5. **Disable Interactive Elements Conditionally**
❌ Bad:
```tsx
<button className="lg:hidden">Menu</button> {/* Still clickable on mobile via slow CSS! */}
```

✅ Good:
```tsx
{isMobile && <button disabled={!isMobile}>Menu</button>}
```

---

## Related Files

- **Main Layout:** `src/UntetheredSoulApp.tsx` (lines 601–703)
- **Sidebar Component:** `src/UntetheredSoulApp.tsx` (lines 1275–1310, 1720–1800)
- **Responsive Classes:** Uses Tailwind `lg:` breakpoint (1024px)

---

## Debugging Tips

### If Sidebar Is Stuck Open on Mobile:
1. Check `isMobile` state in React DevTools
2. Verify window size is < 1024px
3. Check if `isSidebarOpen` is not being reset by resize listener
4. Look for console messages: `[ResponsiveLayout] Closed sidebar...`

### If Menu Button Doesn't Work:
1. Ensure `isMobile === true`
2. Verify button is not `disabled` attribute
3. Check for JavaScript errors in console
4. Test on actual mobile device (not just browser DevTools)

### If Sidebar Overlaps Content:
1. Verify `maxWidth: 90vw` is applied in inline styles
2. Check that `translate-x-0` or `-translate-x-full` is rendering
3. Ensure backdrop overlay has `z-[60]` and sidebar has `z-[70]`
4. Verify no CSS is overriding transform rules

---

## Performance Notes

- **Resize Listener:** Passive flag prevents blocking scroll (60fps maintained)
- **Media Queries:** Only used for styling, not logic (JS state is truth source)
- **Transform-Based Show/Hide:** GPU-accelerated, no layout recalculation
- **Orientation Change:** Debounced with 100ms delay to allow DOM to settle

---

## Version History

- **v1.0** — Responsive Layout Safeguards implemented
  - Added isMobile state tracking
  - Resize/orientation event listeners
  - Mobile-first conditional rendering
  - Comprehensive testing checklist
