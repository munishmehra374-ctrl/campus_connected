import "./style.css";
import Hero from "../../components/Hero";
import Problems from "../../components/Problems";
import Features from "../../components/Features";
import CTA from "../../components/CTA";


const HomePage = () => {
  return (
    <div className="home-container">
      <Hero />
      <Problems />
      <Features />
      <CTA />   
    </div>
  );
};

export default HomePage;
