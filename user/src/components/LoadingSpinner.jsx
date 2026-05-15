/**
 * LoadingSpinner - Reusable loading indicator component
 * Used across auth flows for consistent visual feedback
 */
export function LoadingSpinner() {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '3px solid currentColor',
        borderRightColor: 'transparent',
        animation: 'wheelSpin 0.75s linear infinite',
      }}
      aria-hidden="true"
    />
  );
}

export default LoadingSpinner;
