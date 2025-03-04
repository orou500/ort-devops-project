import {React} from "react";
import "../style/Contact.css";
import useWindowDimensions from '../hooks/useWindowDimensions';
import FootballMan from '../media/football-man.webp'
import { contactConfig } from '../data/contentOption'

export const Contact = ({className}) => {

    const { width } = useWindowDimensions();
  
    const imageSize = {
      width: '60%', // Default width
      height: 'auto' // Maintain aspect ratio
    };
  
    // Adjust size for screens
    if (width <= 480) {
      imageSize.width = '100%'; // Adjust width for smaller screens
    } else if (width >= 1080) {
      imageSize.width = '60%'; // Adjust width for bigger screens
    }

  return ( 
    <div className={className}>
        <h3 className='app-title'>צור קשר:</h3>
        <p>מייל: <a className="footer-company-name" href='mailto:contact@sizops.co.il' target="_blank" rel="noopener noreferrer">{contactConfig.YOUR_EMAIL}</a></p>
        <p>וואטסאפ: <a className="footer-company-name" href={`https://api.whatsapp.com/send?phone=${contactConfig.YOUR_PHONEWA}`} target="_blank" rel="noopener noreferrer">{contactConfig.YOUR_PHONE}</a></p>
        <div className='image'>
            <img 
            className="football-man" 
            src={FootballMan} alt='Football player' 
            style={imageSize} 
            />
        </div>
    </div>
  );
};