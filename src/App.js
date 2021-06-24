import react from 'react';
import logo from './logo.svg';
import './App.scss';
import {ConfigurationContext} from './context/ConfigurationContext'
import LoginControlsPopup from './components/Popups/LoginControls/LoginControlsPopup';
import OperationsPopup from './components/Popups/Operations/OperationsPopup';
import JimmyAjaContainer from './components/JimmyAja/JimmyAjaContainer';


function App() {
  return (
    <ConfigurationContext.Consumer>
      {
        ({baseUrl, jimmyAja, handleApplicationBtnClick, handleInOutClick}) => 
        {
          console.log("state::",baseUrl, jimmyAja)
          return (
            <>
            <LoginControlsPopup 
              handleApplicationBtnClick={handleApplicationBtnClick}
            />
            <OperationsPopup 
              header={"Jimmy Aja"}
              isModalOpen = {jimmyAja.isModalOpen}
              is
              closeModal={handleApplicationBtnClick}
              body={
              <JimmyAjaContainer 
                isCheckedIn={jimmyAja.isCheckedIn}
                isCheckedOut={jimmyAja.isCheckedOut}
                handleInOutClick={handleInOutClick}

              />}
              footer={null}
            />
            </>
          )
        }
      }
      
    </ConfigurationContext.Consumer>
  );
}

export default App;
