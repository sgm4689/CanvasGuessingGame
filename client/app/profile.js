let token, imageURLS, fixedURI;


const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    token = result.csrfToken;
    getImages(token);
  });
};

const handleConnect = (e) =>{
  e.preventDefault();

  sendAjax('POST', '/connect', `id=${msg.value}&_csrf=${token}`, redirect);
}

const ConnectWindow = () =>{
  return(
      <form id="connectForm"
      onSubmit={handleConnect}
      name="connectForm"
      className="connectForm"
      >
        <input id="msg" />
        <input id="connect" type="submit" value="Enter" />
      </form>
  );
  }

const handleChange = (e) => {
  e.preventDefault();

  $("#domoMessage").animate({width:'hide'},350);

  if ($("#oldPass").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("RAWR! Passwords do not match");
    return false;
  }

  sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);

  return false;
};

const PasswordWindow = (props) =>{
  return(
      <form id="passForm"
        name="passForm"
        onSubmit={handleChange}
        action="/changePass"
        method="POST"
        className="mainForm"
      >
        <label htmlFor="oldPass">Current Password: </label>
        <input id="oldPass" type="password" name="oldPass" placeholder="password"/>
        <label htmlFor="pass">Password: </label>
        <input id="pass" type="password" name="pass" placeholder="password"/>
        <label htmlFor="pass2">Password: </label>
        <input id="pass2" type="password" name="pass2" placeholder="password"/>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="formSubmit" type="submit" value="Sign in" />
      </form>
    );
  }

  const Images = () =>{
    return(
      <img src={fixedURI}></img>
      );
  }

  // const Images = () =>{
  //   return(
  //     <Carousel>
  //       {elements.map((value, index) => {
  //         return <Carousel.item><img src={value} key={index}></img></Carousel.item>
  //       })}
  //     </Carousel>
  //   );
  // }

  const getImages = () =>{
    sendAjax('GET', '/images', null, (results) =>{
      imageURLS = results.Drawings;
      //The URI's are stored properly in mongoose, however they're not being retrieved properly.  Instead of the + they're saved with
      //They're being retrieved with spaces.  Until I determine what's wrong, this code'll fix the problem.  Also only displaying the last saved img
      //to reduce clutter on screen
      if (imageURLS.length > 0){
        fixedURI = imageURLS[imageURLS.length-1].img.replace(/ /g, "+");
      }
      createContent();
      displayArt();
    });
  }

const createContent = () => {
  ReactDOM.render(
    <div>
      <ConnectWindow/>
      <PasswordWindow csrf={token}/>
    </div>,
    document.querySelector("#profile")
  );
};

const displayArt = () => {
  if (imageURLS.length > 0){
    ReactDOM.render(<Images />, document.querySelector("#images"));
  }
}


$(document).ready(function() {
  getToken();
});
