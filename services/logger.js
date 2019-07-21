module.exports = {
  debug: (...message) => { console.log('\n[**DEBUG]**: \n', ...mesage); },
  info: (...message) => { console.log('[INFO]: ', ...message); },
  warning: (...message) => { console.log('[WARNING]: ', ...message); },
  error: (...message) => { console.log('[ERROR]: ', ...message); }
}