function() { 
//	Objects.init = function() { 
//		window.each(function(v,k) { if (v && typeof(v['can']) == 'function' && v.can('init')) Objects[k] = v});
//		this.init = false;
//	};
//	Objects.init();
	Screen.frame = function() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x,this.y);
		this.ctx.lineTo(this.x+this.w,this.y);
		this.ctx.lineTo(this.x+this.w,this.y+this.h);
		this.ctx.lineTo(this.x,this.y+this.h);
		this.ctx.lineTo(this.x,this.y);
		this.ctx.stroke();
		this.ctx.closePath();
		this.to(this.w,this.h);
		return this;
	};
}()
