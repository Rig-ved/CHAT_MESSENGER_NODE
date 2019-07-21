module.exports = {
    formatDate: function(args){
      const moment = require('moment');
      return moment(args).calendar(null, {
        sameDay: '[Today] [at] h:mm a',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday] [at] h:mm a',
        lastWeek: 'dddd DD/MM/YYYY [at] h:mm a',
        sameElse: 'DD/MM/YYYY [at] h:mm a'
    });
    },
    checkIf:function (v1, operator, v2, options) {
      var operators = {
        '==': v1 == v2 ? true : false,
        '===': v1 === v2 ? true : false,
        '!=': v1 != v2 ? true : false,
        '!==': v1 !== v2 ? true : false,
        '>': v1 > v2 ? true : false,
        '>=': v1 >= v2 ? true : false,
        '<': v1 < v2 ? true : false,
        '<=': v1 <= v2 ? true : false,
        '||': v1 || v2 ? true : false,
        '&&': v1 && v2 ? true : false
      }
      if (operators.hasOwnProperty(operator)) {
        if (operators[operator]) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
      return console.error('Error: Expression "' + operator + '" not found');
  }



  }