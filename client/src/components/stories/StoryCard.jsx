function StoryCard({ children, gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: gradient,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'white',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: -200,
        right: -200,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.08)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -300,
        left: -200,
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: 'rgba(236, 72, 153, 0.06)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        padding: '140px 80px 100px 80px',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        width: '100%',
        textAlign: 'center',
        zIndex: 2,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 28, fontWeight: 500 }}>
          iMessage Wrapped
        </span>
      </div>
    </div>
  )
}

export default StoryCard
