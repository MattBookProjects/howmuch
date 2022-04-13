
var API_URLS = {
    register: "register",
    user_short_form: "user/shortform",
    get_csrf_token: "csrf",
    login: "login"
};


async function getCsrfToken(){
    let token = null;
    await fetch(API_URLS.get_csrf_token).then(response => response.json()).then(data => token = data.token);
    return token;
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {page: <RegisterPage app={this}/>, navbarFactory: new NavBarFactory({app: this})}
        this.setLoginPage = this.setLoginPage.bind(this);
        this.setRegisterPage = this.setRegisterPage.bind(this);
        this.setMainPage = this.setMainPage.bind(this);
    }

    componentDidMount() {
        this.state.navbarFactory.getNavBar().then(navbar => {
            this.setState({navbar: navbar});
        });
    }

    setRegisterPage() {
        this.setState({page: <RegisterPage app={this}/>});
    }

    setLoginPage(){
        this.setState({page: <LoginPage app={this}/>});
    }

    setMainPage() {
        this.setState({page: <MainPage app={this}/>});
    }

    render(){
        if( !this.state.navbar)
            return (
                <div className="app">
                    LOADING
                </div>
            );
        return (
            <div className="app">
                {this.state.navbar}
                {this.state.page}
            </div>
        );
    }
}

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {items: props.items};
    }

    render() {

        if( !this.state.items ){
            return <div>LOADING</div>;
        } 
            
        return (
            <div className="navbar">
                {this.state.items}
            </div>
        );
    }

}

class NavItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {label: props.label, onclick: props.onclick};
    }

    render() {
        return (
            <div className="nav-item" onClick={this.state.onclick}>{this.state.label}</div>
        );
    }

}

class NavBarFactory {
    constructor(props){
        this.app = props.app;
    }

    async getNavBar(){
        console.log(this.app);
        const data = await fetch(API_URLS.user_short_form).then(response => response.json());
        if( data.user ){
            return <NavBar items={[
                <NavItem label={"HOWMUCH"} onclick={this.app.setMainPage}/>,
                <NavItem label={data.user.username} onclick={this.app.setUserPage}/>,
                <NavItem label={"LOGOUT"} onclick={this.app.setLoginPage}/>,
            ]}/>;
                    
        } else {
            return <NavBar items={[
                <NavItem label={"HOWMUCH"} onclick={this.app.setMainPage}/>,
                <NavItem label={"LOGIN"} onclick={this.app.setLoginPage}/>,
                <NavItem label={"REGISTER"} onclick={this.app.setRegisterPage}/>,
            ]}/>;
        }
    }
}

class RegisterPage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {app: props.app}
    }

    render() {
        return (
            <div className="register-page">
                <div className="form-label">REGISTER</div>
                <RegisterForm app={this.state.app}/>
            </div>
        )
    }

}

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: "", placeholder: props.placeholder};
    }

    render() {
        return (
            <input className="text-input" type="text" placeholder={this.state.placeholder} onChange={event => this.setState({value: event.target.value})}/>
        );
    }

    getValue(){
        return this.state.value;
    }
}


class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {app: props.app, username: "", password: "", repeatPassword: "", errorMessage: undefined}
        this.register = this.register.bind(this);
        /*this.state = {
            app: props.app,
            usernameInput: <TextInput placeholder="Username"/>,
            passwordInput: <PasswordInput placeholder="Password"/>,
            repeatPasswordInput: <PasswordInput placeholder="Repeat Password"/>,
            submitButton: <Button label="REGISTER" onClick={() => this.register()}/>
        }
        this.register = this.register.bind(this);*/
    }

    register() { 
        this.setState({errorMessage: undefined});
        if( this.state.username === "" ){
            this.setState({errorMessage: "Username can't be empty"});
        }
        else if( this.state.password === ""){
            this.setState({errorMessage: "Password can't be empty"});
        }
        else if( this.state.password !== this.state.repeatPassword ){
            this.setState({errorMessage: "Passwords don't match"});
        }
        else {
            getCsrfToken().then(token => {
            fetch(API_URLS.register, {
                method: 'POST',
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password
                }),
                headers: {
                    'X-CSRFToken': token
                }
            }).then(response => {
                if( response.status === 201 ){
                    this.state.app.setMainPage();
                }
                else if(response.status == 409 ){
                    response.json().then(data => this.setState({errorMessage: data.message}));
                }
            })
        })
        }
        

    }

    render() {
        return (
            <div className="register-form">
                <input type="text" className="text-input" placeholder="Username" value={this.state.username} onChange={event => this.setState({username: event.target.value})}/>
                <input type="password" className="text-input" placeholder="Password" value={this.state.password} onChange={event => this.setState({password: event.target.value})}/>
                <input type="password" className="text-input" placeholder="Repeat Password" value={this.state.repeatPassword} onChange={event => this.setState({repeatPassword: event.target.value})}/>
                <button className="button" onClick={this.register}>REGISTER</button>
                {this.state.errorMessage !== undefined && <ErrorMessage message={this.state.errorMessage}/>}
            </div>
        );
    }
}



class PasswordInput extends TextInput{
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <input className="text-input" type="password" placeholder={this.state.placeholder} value={this.state.value} onChange={event => this.setState({value: event.target.value})}/>
        );
    }
}

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {label: props.label, onClick: props.onClick}
    }

    render() {
        return (
            <button className="button" onClick={this.state.onClick}>{this.state.label}</button>
        )
    }
}



function ErrorMessage(props){
    return (
        <div className="error-message">
            {props.message}
        </div>
    );
}


class LoginPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {app: props.app }
    }

    render(){
        return (
            <div className="login-page">
                <div className="form-label">LOGIN</div>
                <LoginForm app={this.state.app}/>
            </div>
        )
    }

}

class LoginForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {app: props.app, username: "", password: "", errorMessage: undefined,}
    }

    login(){
        this.setState({errorMessage: undefined})
        getCsrfToken().then(token => {
            fetch(API_URLS.login, {
                method: "POST",
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password
                }),
                headers: {
                    "X-CSRFToken": token
                }
            }).then(response => {
                if( response.status === 200 ){
                    this.state.app.setMainPage();
                } else {
                    response.json().then(data => this.setState({errorMessage: data.message}));
                }
            })
        })
    }

    render(){
        return (
            <div className="login-form">
                <input className="text-input" type="text" placeholder="Username" value={this.state.username} onChange={event => this.setState({username: event.target.value})}/>
                <input className="text-input" type="password" placeholder="Password" value={this.state.password} onChange={event => this.setState({password: event.target.value})}/>
                <button className="button" onClick={this.login}>LOGIN</button>
                {this.state.errorMessage !== undefined && <ErrorMessage message={this.state.errorMessage}/>}
            </div>
        );
    }
}

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {app: props.app}
    }

    render(){
        return (
            <div>
                NOT IMPLEMENTED YET
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector("#app"));

