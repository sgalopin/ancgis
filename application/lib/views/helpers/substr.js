module.exports = function(length, context, options) {
  if ( Array.isArray(context) ) {
    context = context.join(', ');
  }
  if ( typeof context === 'string' && context.length > length ) {
    return context.substring(0, length) + "...";
  } else {
    return context;
  }
};
