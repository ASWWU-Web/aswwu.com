//globalsnow variables
var ctx;
var W;
var H;
var mp = Math.floor((window.innerHeight*window.innerWidth)/31762); //max particles based on screen size
var particles = [];
var timeout;
function letItSnow() {
	//canvas init
  var canvas = document.getElementById("snow");
  ctx = canvas.getContext("2d");

	//canvas dimensions
	W = window.innerWidth;
	H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

  addFlakes();
  window.addEventListener('resize', resizeCanvas);

	//animation loop
	setInterval(draw, 33);
}

function resizeCanvas() {
  var canvas = document.getElementById("snow");
  mp = Math.floor((window.innerHeight*window.innerWidth)/31762); //max particles based on screen size
  //canvas dimensions
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  addFlakes();
}
function addFlakes() {
  clearInterval(timeout);
  if(particles.length >= mp)
  return;
  //Slowly add the flakes
  timeout = window.setInterval(function(){
    particles.push({
      x: Math.random()*W, //x-coordinate
      y: -4, //y-coordinate
      r: Math.random()*4+1, //radius
      d: Math.random()*mp //density
    });
    if(particles.length >= mp)
      clearInterval(timeout);
  },500);
}

//Lets draw the flakes
function draw()
{
	ctx.clearRect(0, 0, W, H);

	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.beginPath();
	for(var i = 0; i < particles.length; i++)
	{
		var p = particles[i];
		ctx.moveTo(p.x, p.y);
		ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
	}
	ctx.fill();
	update();
}

//Function to move the snowflakes
//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
var angle = 0;
function update()
{
	angle += 0.01;
  var p;
	for(var i = 0; i < particles.length; i++)
	{
		p = particles[i];
		//Updating X and Y coordinates
		//We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
		//Every particle has its own density which can be used to make the downward movement different for each flake
		//Lets make it more random by adding in the radius
		p.y += Math.cos(angle+p.d) + 1 + p.r/2;
		p.x += Math.sin(angle) * 1.5;

		//Sending flakes back from the top when it exits
		//Lets make it a bit more organic and let flakes enter from the left and right also.
		if(p.x > W+5 || p.x < -5 || p.y > H)
		{
			if(i%6 > 0) //66.67% of the flakes
			{
				particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
			}
			else
			{
				//If the flake is exitting from the right
				if(Math.sin(angle) > 0)
				{
					//Enter from the left
					particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
				}
				else
				{
					//Enter from the right
					particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
				}
			}
		}
	}
}
