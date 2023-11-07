sap.ui.define([], function() {
    "use strict";
  
    return {
      formatInitial: function(sUname) {
        if(sUname){
            return sUname.substr(0,1);
        }
        return "";
      },
      completion:function(iPercent){
          if(iPercent <= 50){
              return "Error";
          } else if (iPercent <= 99){
              return "Warning";
          }
          return "Success";
      }

    };
  });
  