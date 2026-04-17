import CanvasWrapper from './components/common/CanvasWrapper';
import ScrollWrapper from './components/common/ScrollWrapper';
import Hero from './components/hero/Hero';
import Experience from './components/experience/Experience';
import Footer from './components/footer/Footer';

const App = () => {
  return (
    <CanvasWrapper>
      <ScrollWrapper>
        <Hero />
        <Experience />
        <Footer />
      </ScrollWrapper>
    </CanvasWrapper>
  );
};

export default App;
