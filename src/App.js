import './App.css';
import Inbox from './components/inbox';
import SignIn from './components/signin';
import { Route, Routes } from 'react-router-dom';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<SignIn />}/>
        <Route path='/inbox' element={<Inbox />} />
      </Routes>
    </div>
  );
}

export default App;
