var uiImgCaches = {};
function getImage(src) {
    var c = uiImgCaches;
    if(c[src]) {
        return c[src];
    }else {
        c[src] = new Image();
        c[src].src = src;
        return c[src];
    }
}
function rand(d) {
    return Math.floor(Math.random()*d);
}
function rand_smooth(d,n) {
    if(!n) return 0;
    var res = 0;
    for(var i = 0;i < n;i++) res += rand(d);
    return res/n;
}
const DEFCOL = {
    BACK:"#222",
    TEXT:"#ff0",
    BTNBACK:"#444",
}
class Rect {
    constructor(s,y,w,h) {
        if(typeof(s) == Object)
        {
            this.x = s.x;
            this.y = s.y;
            this.w = s.w;
            this.h = s.h;
            return;
        }

        this.x = s;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    isHit = function(x,y) {
        if(x > this.x && x < this.x+this.w && y > this.y && y < this.y + this.h)
        {
            return true;
        }
        return false;
    }
    isTouch = function(x,y,w,h)
    {
        if(x + w > this.x && x < this.x+this.w && y + h > this.y && y < this.y + this.h)
        {
            return true;
        }
        return false;
    }
    clone()
    {
        return new Rect(this.x,this.y,this.w,this.h);
    }
    merge(r)
    {
        this.x = Math.min(this.x,r.x);
        this.y = Math.min(this.y,r.y);
        this.w = Math.max(this.w,r.w);
        this.h = Math.max(this.h,r.h);
    }
    saturate(mx,my,x,y)
    {
        if(this.x < mx)
            this.x = mx;
        else if(this.x > x)
            this.x = x;
        if(this.y < my)
            this.y = my;
        else if(this.y > y)
            this.y = y;
    }
    setCenter=function(x,y) {
        this.x = x - this.w/2;
        this.y = y - this.h/2;
    }
}
class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    eq(pos)
    {
        if(this.x == pos.x && this.y == pos.y)
        return true;
        return false;
    }
    add(x,y)
    {
        this.x += x;
        this.y += y;
    }
    set(x,y) {
        this.x = x;
        this.y = y;
    }
    dist(pt) {
        var sx = this.x - pt.x;
        var sy = this.y - pt.y;
        var val = Math.sqrt(sx*sx+sy*sy);
        //if(o) o = new Point(sx/val,sy/val);
        return val;
        
        //return new Point(sx/val,sy/val);
    }
    copy(pt)
    {
        this.x = pt.x;
        this.y = pt.y;
    }
    saturate(x,y)
    {
        if(this.x < 0)
            this.x = 0;
        else if(this.x > x)
            this.x = x;
        if(this.y < 0)
            this.y = 0;
        else if(this.y > y)
            this.y = y;
    }

}
class Obj {
    constructor(x,y,w,h) {
        this.rct = new Rect(x,y,w,h);
        this.hidden = false;
    }
    isTouch(o) {
        return this.rct.isTouch(o.rct.x,o.rct.y,o.rct.w,o.rct.h);
    }
    isHit(x,y) {
        if(this.hidden) return false;
        var off = this.getOffset(0,0);
        return this.rct.isHit(x-off.x,y-off.y);
    }
    setPos(x,y) {
        this.rct.x = x;
        this.rct.y = y;
    }
    getOffset(x,y) {
        var p = this.parent;
        if(p) {
            return p.getOffset(x+p.rct.x,y+p.rct.y);
        }
        return new Point(x,y);
    }
    getParentPnl() {
        var p = this.parent;
        
        if(p) {
            
            if(p.onclick) {
                return p;
            }
        }
    }
    
    onclick() {
        
    }
    hide() {
        this.hidden = true;
    }
    show() {
        this.hidden = false;
    }
    blink()
    {
        this.hidden = !this.hidden;
    }
    drawBack(ctx,col,x = 0,y = 0)
    {
        ctx.fillStyle = col;
        var r = this.rct;
        ctx.fillRect(r.x+x,r.y+y,r.w,r.h);
    }
 
 }
 class TextBox extends Obj {
 
     constructor(t,x,y,w,h) {
         super(x,y,w,h);
         this.text = t;
     }
     draw(ctx) 
     {
         var r = this.rct;
         ctx.fillStyle ="rgb(50,50,50)";
         ctx.fillRect(r.x,r.y,r.w,r.h);
         ctx.fillStyle ="#fff";
         ctx.fillText(this.text,r.x+5,r.y+25);
     }
 }
 class ImgBox extends Obj {
     constructor(img,x,y,w,h) {
         super(x,y,w,h);
         this.img = new Image();
         this.img.src = img;
     }
     draw(ctx) 
     {
         var r = this.rct;
         ctx.drawImage(this.img,r.x,r.y);
     }
 }
 class Button extends Obj {
    constructor(sid,t,x,y,w,h,color = null) {
        super(x,y,w,h);
        this.id = sid;
        this.text = t;

        this.color = color ? color : 
        {
            back : DEFCOL.BTNBACK,
            backActive: "#666",
            text : DEFCOL.TEXT,
            textActive: "#ffa"
        };
        
    }
    draw(ctx,x = 0,y = 0) 
    {
        var r = this.rct;
        x += r.x;
        y += r.y;
        var b = this == onObj;
        var s = b && g_mouse.down ? 2 : 0;
        ctx.fillStyle = this.color[b ? "backActive" : "back"];//"#666":DEFCOL.BTNBACK;
        ctx.fillRect(x+s,y+s,r.w-s*2,r.h-s*2);
        ctx.fillStyle = this.color[b? "textActive" : "text"];// b ? "#ffa":DEFCOL.TEXT;
        ctx.fillText(this.text,x+5,y+15);
    }
 }
 class IconButton extends Obj {
    constructor(sid,src,x,y,w,h,spos=null) {
        super(x,y,w,h);
        this.id = sid;
        this.icon = src;//getImage(src);
        this.pushed = false;
        this.spos = spos;
    }
    draw(ctx,x,y) 
    {
        x = x ? x : 0;
        y = y ? y : 0;
        var r = this.rct;
        x += r.x;
        y += r.y;
        var b = this == onObj;
        
        var s = b && g_mouse.down ? 3 : 0;
        ctx.fillStyle =b ? "#aaa":"#666";
        ctx.fillRect(x+s,y+s,r.w-s*2,r.h-s*2);//this.pos.y,this.width,this.height);
        s+=2;
        if(this.spos) {
            var p = this.spos;
            ctx.drawImage(this.icon,p.x,p.y,p.w,p.h,x+s,y+s,r.w-s*2,r.h-s*2);
        }
        else ctx.drawImage(this.icon,x+s,y+s,r.w-s*2,r.h-s*2);
        //ctx.fillStyle = b ? "#ffa":"#cc8";
        //ctx.fillText(this.text,r.x+5,r.y+25);
    }
 }
 class Container extends Obj {
     objs = [];
     addObj(o) {
        this.objs.push(o);
        o.parent = this;
        return o;
    }
    
    draw(ctx,x = 0,y = 0) {
        if(this.hidden) return;
        if(this.drawBefore) this.drawBefore(ctx,x,y);
        for(var i = 0;i < this.objs.length;i++) {
            if(this.objs[i].hidden) continue;
            this.objs[i].draw(ctx,this.rct.x + x,this.rct.y + y);
        }
        if(this.drawAfter) this.drawAfter(ctx,x,y);

    }
    getObj(x,y) {
        if(this.hidden) return null;
        for(var i = 0;i < this.objs.length;i++) {
            var o = this.objs[this.objs.length-i-1];
            if(o.hidden) continue;
            if(o.isHit(x,y)) {
                if(o.getObj) return o.getObj(x,y);
                else return o;
            }
        }
        if(this.self == true && this.isHit(x,y))
        {
            return this;
        }
        return null;
    }
 }

 function drawText(ctx,text,x,y,w,h = 0)
 {
    if(h) {
        y += h;
    }else y += 13;
    ctx.fillText(text,x,y);
 }
 function drawTextC(ctx,text,x,y,w,h=0)
 {
    var a = ctx.measureText(text);
    x += (w-a.width)/2;
    if(h)
    {
        var th =  a.actualBoundingBoxAscent 
                               + a.actualBoundingBoxDescent;
        
        h = (h+th)/2;
    }
    drawText(ctx,text,x,y,w,h);
 }
 function drawTextR(ctx,text,x,y,w,h=0)
 {
    var a = ctx.measureText(text);
    x += (w-a.width);
    drawText(ctx,text,x,y, w,h);
 }