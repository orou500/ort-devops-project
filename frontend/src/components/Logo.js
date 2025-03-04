import { Link } from "react-router-dom";
import "../style/Logo.css";
import { Navbar } from "./Navbar";
import { GiSoccerBall } from "react-icons/gi";
import { useAuth } from "../hooks/useAuth";


export const Logo = ({isChecked, handleChange, noNav, auth}) => {

    const { setAuth } = useAuth();
    return (
        <div className="logo-continer">
            <h1><Link to='/' className="logo"><span className="marker-blue">FLM</span><GiSoccerBall /><span className="marker-pink">APP</span></Link></h1>
            {
                noNav ? (
                    <>
                    </>
                ) : (
                    <Navbar 
                        isChecked={isChecked}
                        handleChange={handleChange}
                        auth={auth}
                        setAuth={setAuth}
                    />
                )
            }
        </div>
    );
  };