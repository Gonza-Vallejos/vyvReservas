const AuthVehicle = ({ eyesClosed = false }) => (
  <div className="auth-vehicle" aria-hidden="true">
    <svg viewBox="0 0 360 150" role="presentation">
      <path className="auth-vehicle__shadow" d="M42 130h270" />
      <g className="auth-vehicle__body">
        <path
          className="auth-vehicle__shell"
          d="M44 104V62c0-11 9-20 20-20h164l48 35h30c8 0 14 6 14 14v13h-14a26 26 0 0 1-51 0H102a26 26 0 0 1-51 0H44Z"
        />
        <path className="auth-vehicle__window" d="M80 51h80v31H66V65c0-8 6-14 14-14Zm91 0h52l38 31h-90V51Z" />
        <path className="auth-vehicle__stripe" d="M45 86h274v10H45z" />
        <circle className="auth-vehicle__wheel" cx="76" cy="105" r="18" />
        <circle className="auth-vehicle__wheel" cx="280" cy="105" r="18" />
        <circle className="auth-vehicle__hub" cx="76" cy="105" r="7" />
        <circle className="auth-vehicle__hub" cx="280" cy="105" r="7" />
        <g className={`auth-vehicle__face ${eyesClosed ? 'auth-vehicle__face--closed' : ''}`}>
          <circle className="auth-vehicle__eye" cx="218" cy="69" r="5" />
          <circle className="auth-vehicle__eye" cx="244" cy="69" r="5" />
          <path className="auth-vehicle__smile" d="M224 76c4 5 10 5 14 0" />
        </g>
        <path className="auth-vehicle__light" d="M304 67h10v12h-10z" />
      </g>
    </svg>
    <span className="auth-vehicle__caption">Viajá seguro con V&V</span>
  </div>
);

export default AuthVehicle;
