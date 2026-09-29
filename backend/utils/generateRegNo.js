function generateRegNo() {
  let regNo = "";
  for (let i = 0; i < 16; i++) {
    regNo += Math.floor(Math.random() * 10);
  }
  return regNo;
}

module.exports = generateRegNo;
