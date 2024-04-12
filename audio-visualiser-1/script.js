window.addEventListener('load',function(){//when all the assets of the website are loaded the following function runs
  //Setting up
  const canvas = document.getElementById("canvas1")
  const ctx = canvas.getContext("2d")
  const snail = document.getElementById("snail")
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight 
  let barheight = 500

  //Classes
  class Bar{
    constructor(x,y,width,height,color,index){
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color
      this.index = index
    }

    //update(micInput,barheight){
    update(micInput){
      const sound = micInput *barheight//to change the bar height, change the multiplier
      console.log(barheight)
      if (sound > this.height){
        this.height = sound
      }
      else {
        this.height -= this.height * 0.03
      }
    }

    draw(context){
      context.strokeStyle = this.color
      context.lineWidth = this.width 
      context.save()//built in save and restore context method
      context.rotate(this.index*0.043)
      context.beginPath()
      //context.moveTo(0,0)
      //context.lineTo(this.x,this.y + this.height)
      context.bezierCurveTo(this.x/2,this.y/2, this.height * -0.5 -150,this.height+50,this.x, this.y)
      context.stroke()
      if(this.index > 150){//change the value to limit the number of lines to draw
        context.beginPath();
        context.arc(this.x,this.y+10+this.height/2 + this.height * 0.1,this.height * 0.05,0,Math.PI*2)
        context.stroke()
        context.beginPath()
        context.moveTo(this.x,this.y+10)
        context.lineTo(this.x,this.y + 10 + this.height/2)
        context.stroke()
      }
      context.restore()//will ensure other elements of the element are not disturbed; will restore the element to the state it was 
    }
  }
  
  class Microphone{
    constructor(fftSize){//fast fourier transform property-- built in web audio api
      this.initialized = false
      navigator.mediaDevices.getUserMedia({audio:true})
      .then(function(stream){
          this.audioContext = new AudioContext()
          this.microphone = this.audioContext.createMediaStreamSource(stream)
          this.analyser = this.audioContext.createAnalyser()
          this.analyser.fftSize = fftSize
          const bufferLength = this.analyser.frequencyBinCount//always half of fftSize
          this.dataArray = new Uint8Array(bufferLength)//can only contain unsigned 8-bit integers with values between 0 and 255
          this.microphone.connect(this.analyser)//to connect audio nodes
          this.initialized = true
        }.bind(this)).catch(function(err){//deals with rejected promises
          alert(err)
        })
    }
    getSamples(){
      this.analyser.getByteTimeDomainData(this.dataArray)//copies analyser time-domain data into array we pass to it
      let normSamples = [...this.dataArray].map(e => e/128 - 1)//each valye between 0 and 255 hence, values between -1 and 1 
      return normSamples
    }
    getVolume(){
      this.analyser.getByteTimeDomainData(this.dataArray)//copies analyser time-domain data into array we pass to it
      let normSamples = [...this.dataArray].map(e => e/128 - 1)//each value of dataArray between 0 and 255 hence, values between -1 and 1 
      let sum = 0;
      for(let i = 0;i<normSamples.length;i++){
        sum += normSamples[i] * normSamples[i]
      } let volume = Math.sqrt(sum/normSamples.length)
      return volume
    }
  }

  //More setting up
  let fftSize = 512
  const microphone = new Microphone(fftSize)
  let bars = []
  let barWidth = canvas.width/(fftSize/2)

  //Functions
  function createBars(){
    for(let i = 1; i<(fftSize/2);i++){
      let color = 'hsl(' + i * 2 + ',100%,50%)'//hsl color declaration, to make the color change faster change the number value multiplied to 'i' and/or adding values such as 100,so on... by doing so color spectrum begins with a diff color
      bars.push(new Bar(0,i*0.9,1,0,color,i))
    }
  }

  createBars()

  //Menu bar -- in the works
  let menuToggleButton= document.getElementById("Menu")
  let menuBar = document.getElementById("Menubar")
  let submitButton = document.getElementById("submit")
  let barHeight = document.getElementById("bar-height")
  let hideButton = document.getElementById("hide")
  menuToggleButton.addEventListener("click",Display)
  hideButton.addEventListener("click",Hide)
  submitButton.addEventListener("click",getBarHeight)
  function Display(){
    menuBar.style.display = 'block'
  }
  function Hide(){
    menuBar.style.display = 'none'
  }
  function getBarHeight(){
    barheight= barHeight.value
    console.log("barheight"+barheight)
    console.log("value entered:" + barHeight.value)
  }

  //end of menu bar
  let softVolume = 0
  function animate(){
    if (microphone.initialized === true){
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const samples = microphone.getSamples();
      const volume = microphone.getVolume()
      ctx.save()
      ctx.translate(canvas.width/2-70,canvas.height/2+50)//hard coding values works for different screen widths since svg has fixed width
      bars.forEach(function(bar,i){
        //bar.update(samples[i],barheight)
        bar.update(samples[i])
        bar.draw(ctx)
      })
      ctx.restore()
      softVolume = softVolume * 0.9 + volume * 0.1
      snail.style.transform = 'translate(-50%,-50%) scale(' + (1 + softVolume*1.5),(1+softVolume*1.5)+')'//replaced 3 with 1.5
    }
    requestAnimationFrame(animate)
  }
  animate()
  window.addEventListener('resize',function(){//to make it responsive when called
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight
  })
})
