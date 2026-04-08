import { useMemo } from 'react';
import HomeHeader from './HomeHeader';
import Specialty from './Section/Specialty';
import MedicalFacility from './Section/MedicalFacility';
import OutStandingDoctor from './Section/OutStandingDoctor';
import './HomePage.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface SliderSettings {
  dots: boolean;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slideToScroll: number;
}

const HomePage = () => {
  const settings: SliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slideToScroll: 1,
    }),
    []
  );

  return (
    <div>
      <HomeHeader isShowBanner={true} />
      <Specialty settings={settings} />
      <MedicalFacility settings={settings} />
      <OutStandingDoctor settings={settings} />
    </div>
  );
};

export default HomePage;
