document.addEventListener(
  'wheel',
  function (event) {
    event.preventDefault()

    const scrollAmount = event.deltaY * 2 // Multiplied by 3 to increase scroll distance
    const duration = 250 // Reduced from 500ms to 250ms for faster scrolling
    const start = window.pageYOffset
    const target = start + scrollAmount
    const startTime = performance.now()

    function animate (currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Modified easing function for snappier movement
      const easeOutQuad = t => 1 - (1 - t) * (1 - t)

      window.scrollTo(0, start + (target - start) * easeOutQuad(progress))

      if (progress < 1) {
        window.requestAnimationFrame(animate)
      }
    }

    window.requestAnimationFrame(animate)
  },
  { passive: false }
)
