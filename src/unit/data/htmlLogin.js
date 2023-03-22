export const html = `
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

export const htmlSmall = `

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

	
			<label for="username"><b>Username</b></label>


</body>
</html>
`