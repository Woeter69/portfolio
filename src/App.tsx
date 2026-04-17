import CanvasWrapper from './components/common/CanvasWrapper';
import ScrollWrapper from './components/common/ScrollWrapper';
import Hero from './components/hero/Hero';
import WatchtowerScene from './components/watchtower/WatchtowerScene';

const App = () => {
  return (
    <CanvasWrapper>
      <ScrollWrapper>
        <Hero />
        <WatchtowerScene />
      </ScrollWrapper>
    </CanvasWrapper>
  );
};

export default App;
