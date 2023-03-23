export const html1 = `
<!DOCTYPE html>
<html>
<head>
	<title>Login Form</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}
		
		.container {
			background-color: #fff;
			padding: 20px;
			border-radius: 10px;
			box-shadow: 0px 0px 10px #888888;
			margin-top: 50px;
			max-width: 400px;
			margin-left: auto;
			margin-right: auto;
		}
		
		input[type=text], input[type=password] {
			width: 100%;
			padding: 10px;
			margin: 5px 0 22px 0;
			display: inline-block;
			border: none;
			background: #f2f2f2;
			border-radius: 5px;
		}
		
		input[type=text]:focus, input[type=password]:focus {
			background-color: #ddd;
			outline: none;
		}
		
		hr {
			border: 1px solid #f1f1f1;
			margin-bottom: 25px;
		}
		
		button[type=submit] {
			background-color: #4CAF50;
			color: white;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			width: 100%;
			margin-bottom:10px;
		}
		
		button[type=submit]:hover {
			opacity: 0.8;
		}
		
		.cancelbtn {
			background-color: #f44336;
			color: white;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			width: 100%;
			margin-bottom:10px;
		}
		
		.cancelbtn:hover {
			opacity: 0.8;
		}
		
		.container a {
			color: dodgerblue;
		}
		
		span.psw {
			float: right;
			padding-top: 16px;
		}
	</style>
</head>
<body>

	<form action="/action_page.php">
		<div class="container">
			<h1>Login</h1>
			<p>Please fill in this form to access your account.</p>
			<hr>
			
			<label for="username"><b>Username</b></label>
			<input type="text" placeholder="Enter Username" name="username" required>
			
			<label for="password"><b>Password</b></label>
			<input type="password" placeholder="Enter Password" name="password" required>
			
			<button type="submit">Login</button>
			<label>
				<input type="checkbox" checked="checked" name="remember"> Remember me
			</label>
		</div>

		<div class="container" style="background-color:#f1f1f1">
			<button type="button" class="cancelbtn">Cancel</button>
			<span class="psw">Forgot <a href="#">password?</a></span>
		</div>
	</form>

</body>
</html>
`

export const html2 = `

<!DOCTYPE html>
<html>
<head>
	<title>Login Form</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}

		button {
			border: 1px solid black;
			background:yellow
		}
		button:hover {
			background:red;
		}

		div {
			margin-bottom:10px;
			padding:10px
		}

		input{
			border: 1px solid red;
		}
	</style>
</head>
<body>

	<!--

	<label>
				<input type="checkbox" checked="checked" name="remember"> Remember me
			</label>



	<div>
	<label for="password"><b>Password</b></label>
	<input type="password" placeholder="Enter Password" name="password" required>
</div>
	
		<label for="username"><b>Username</b> <i>italice</i></label>

	
	<div>
		<label for="lastname"><b>Lastname</b> (Name of father)</label>
	</div>

	<div>
		<button>Click</button>
	</div>
	-->
	<button>Click2</button>
	<input type="submit" value="Login">
	<input type="reset" value="Reset">
	

</body>
</html>
`

export const html3 = `
<html>

<head>
	<title>Login Page</title>
	<!-- Adding custom styles -->
	<style type="text/css">
		.btn{
			background-color: red;
			color: white;
			padding: 10px;
			border: none;
			margin: 10px;
			border-radius: 10px;
			cursor: pointer;
		}
		.forgot-password{
			color: blue;
			margin: 10px;
		}
	</style>
</head>
<body>
	<!-- Login Form -->
	<form>
		<label>Username: </label>
		<input type="text"><br>
		<label>Password: </label>
		<input type="password"><br>
		<input type="submit" value="Login" class="btn">
	</form>
	<!-- Forget Password Link -->
	<a href="#" class="forgot-password">Forgot Password?</a>
</body>
`


export const html4 = `
<html>

<head>
	<title>Login Page</title>
	<style>
		body {
			background-color: #eee;
			font-family: Arial, Helvetica, sans-serif;
		}
		h1 {
			text-align: center;
		}
		form {
			margin: 50px auto;
			background-color: #fff;
			padding: 20px;
			width: 400px;
			box-shadow: 0px 2px 10px rgba(0,0,0,0.3);
			border-radius: 5px;
		}
		input[type="text"],
		input[type="password"] {
			display: block;
			margin: 10px 0;
			padding: 10px;
			width: 100%;
			border-radius: 5px;
			border: none;
			box-shadow: 0px 2px 10px rgba(0,0,0,0.3);
		}
		input[type="submit"],
		a {
			font-weight: bold;
			color: #fff;
			background-color: red;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			text-decoration: none;
			display: inline-block;
			margin: 10px 0;
			cursor: pointer;
		}
		input[type="submit"]:hover,
		a:hover {
			background-color: #FF2E2E;
		}
		input[type="checkbox"] {
			margin-right: 10px;
		}
		label {
			display: inline;
			font-size: 16px;
			font-weight: bold;
			margin: 10px 0;
		}
	</style>
</head>
<body>
	<h1>Login Page</h1>
	<form>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" placeholder="Enter your username">
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" placeholder="Enter your password">
		
		<input type="submit" value="Login">
		<a href="#">Forget Password?</a>
	</form>
</body>`


export const html5 = `
<html>

  <head>
    <title>Login Page</title>
    <style>
      input[type="text"], input[type="password"] {
        width: 100%;
        padding: 12px 20px;
        margin: 8px 0;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }
      button {
        background-color: red;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        padding: 12px 20px;
        margin-top: 10px;
      }
      button:hover {
        opacity: 0.8;
      }
      a {
        color: red;
        text-decoration: none;
      }
      form {
        margin: 0 auto;
        padding: 50px;
        width: 400px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      h2 {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h2>Login Page</h2>
    <form>
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" placeholder="Enter your username">
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" placeholder="Enter your password">
      <button type="submit">Login</button>
      <a href="#">Forget password?</a>
    </form>
  </body>
</html>`