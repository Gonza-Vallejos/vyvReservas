const AuthVehicle = ({ eyesClosed = false }) => (
  <div className="auth-vehicle" aria-hidden="true">
    <svg viewBox="0 0 360 190" role="presentation">
      <path className="auth-vehicle__shadow" d="M72 166h216" />
      <g className="auth-vehicle__body">
        <path
          className="auth-vehicle__shell"
          d="M84 145V58c0-20 16-36 36-36h120c20 0 36 16 36 36v87H84Z"
        />
        <path className="auth-vehicle__window" d="M112 38h136c10 0 18 8 18 18v34H94V56c0-10 8-18 18-18Z" />
        <path className="auth-vehicle__window-divider" d="M180 39v51" />
        <path className="auth-vehicle__stripe" d="M84 104h192v13H84z" />
        <circle className="auth-vehicle__wheel" cx="112" cy="145" r="20" />
        <circle className="auth-vehicle__wheel" cx="248" cy="145" r="20" />
        <circle className="auth-vehicle__hub" cx="112" cy="145" r="8" />
        <circle className="auth-vehicle__hub" cx="248" cy="145" r="8" />
        <g className={`auth-vehicle__face ${eyesClosed ? 'auth-vehicle__face--closed' : ''}`}>
          <circle className="auth-vehicle__eye" cx="155" cy="70" r="6" />
          <circle className="auth-vehicle__eye" cx="205" cy="70" r="6" />
          <path className="auth-vehicle__smile" d="M166 80c8 8 20 8 28 0" />
        </g>
        <path className="auth-vehicle__light" d="M96 120h17l-5 12H96zM247 120h17l5 12h-17z" />
        <path className="auth-vehicle__grille" d="M158 123h44v10h-44z" />
        <path className="auth-vehicle__bumper" d="M92 143h176" />
      </g>
    </svg>
    <span className="auth-vehicle__caption">Viajá seguro con V&V</span>
  </div>
);

export default AuthVehicle;
