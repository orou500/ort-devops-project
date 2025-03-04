import {React} from "react";
import { Link } from "react-router-dom";
import "../style/Footer.css";
import { FaMeta, FaInstagram } from "react-icons/fa6";
import { GiSoccerBall } from "react-icons/gi";

export const Footer = () => {
  return (
    <div className="footer-distributed">

    <div className="footer-left">

        <div>
          <Link to='/' className="logo-footer"><span className="marker-blue">FLM</span><GiSoccerBall /><span className="marker-pink">APP</span></Link>
          <Link to='/versions' className="logo-footer"><p>גירסה 1.2</p></Link>
        </div>
        <div className="icons-social">
            <a className="footer-social" href="https://www.facebook.com/SizOps" target="_blank" rel="noopener noreferrer">
              <FaMeta />
            </a>
            <a className="footer-social" href="https://www.instagram.com/SizOps/" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
        </div>
        <p className="footer-company-name"><a className="footer-company-name" href="https://api.whatsapp.com/send?phone=972503253027" target="_blank" rel="noopener noreferrer">SizOps</a> © זכויות יוצרים</p>
    </div>

</div>
  );
};