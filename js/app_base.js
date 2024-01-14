class AppBase 
{
    constructor()
    {
        this.guis = {};
    }
    setGUI(sid)
    {
        this.gui = this.guis[sid];
    }
    addGUI(o,sid)
    {
        this.guis[sid] = o;
    }
    
    getObj(x,y) {
        
        var o = null;
        o= this.gui.getObj(x,y);
        if(o) return o;

        if(this.gui && !this.gui.hidden) { 
            o = this.gui.getObj(x,y);
        
            return o;
        }
        return o;
    }
    click(ix,iy) {
         if(onObj) 
         {
            if( onObj.getParentPnl) 
            { 
             var pnl = onObj.getParentPnl();
             
             if(pnl) {
                 if(pnl == this) return;
 
                 pnl.onclick();
             }else {
             }
            }
             return;
         }
         
     }

}