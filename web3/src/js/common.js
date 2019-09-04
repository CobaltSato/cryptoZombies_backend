var contractAddress = "0x1150aFBE434Db783fD62e0Bff2D74217f53EF262";
contractAddress = "0xB9Aa4a40f060f2AC42747d5f0B11d28e7e6C1Fa0";
function calcZombieDetails(zombie, id = -1) { // -1 for sample zombie

    // calc Zombie Details from dna
    //=======================================================================
    let dnaStr = String(zombie.dna)
    // pad DNA with leading zeroes if it's less than 16 characters
    while (dnaStr.length < 16)
        dnaStr = "0" + dnaStr

    let zombieDetails = {
        id: id,
        // copy from zombie
        dna: zombie.dna,
        name: zombie.name,
        readyTime: zombie.readyTime,
        winCount: zombie.winCount,
        lossCount: zombie.lossCount,
        level: zombie.level,
        // plus, result of dna analysis here.
        // first 2 digits make up the head. We have 7 possible heads, so % 7
        // to get a number 0 - 6, then add 1 to make it 1 - 7. Then we have 7
        // image files named "head1.png" through "head7.png" we load based on
        // this number:
        headChoice: dnaStr.substring(0, 2) % 7 + 1,
        // 2nd 2 digits make up the eyes, 11 variations:
        eyeChoice: dnaStr.substring(2, 4) % 11 + 1,
        // 6 variations of shirts:
        shirtChoice: dnaStr.substring(4, 6) % 6 + 1,
        // last 6 digits control color. Updated using CSS filter: hue-rotate
        // which has 360 degrees:
        skinColorChoice: parseInt(dnaStr.substring(6, 8) / 100 * 360),
        eyeColorChoice: parseInt(dnaStr.substring(8, 10) / 100 * 360),
        clothesColorChoice: parseInt(dnaStr.substring(10, 12) / 100 * 360),
        hadhadCat: (parseInt(dnaStr) % 100 === 99),
        zombieDescription: "A Level 1 CryptoZombie",
    }

    return zombieDetails;
}

function generateZombie(zombie, whereToAppend, id = -1) {
    let zombieDetails = calcZombieDetails(zombie, id);
    displayZombie(zombieDetails, whereToAppend);
}

function displayZombie(zombieDetails, whereToAppend) {
    // clone from model
    let model = document.getElementById('model');
    model.classList.remove('hide');
    let newZombie = model.cloneNode(true);
    newZombie.removeAttribute('id');

    for (let i = 1; i <= 7; ++i) { // for 7 head parts
        let headPart = newZombie.getElementsByClassName('head-part-' + i)[0];
        if (i === zombieDetails.headChoice) {
            headPart.classList.remove('hide');
        }
        else {
            headPart.classList.add('hide');
        }
    }
    for (let i = 1; i <= 11; ++i) { // for 11 eye parts
        let eyePart = newZombie.getElementsByClassName('eye-part-' + i)[0];
        if (i === zombieDetails.eyeChoice) {
            eyePart.classList.remove('hide');
        }
        else {
            eyePart.classList.add('hide');
        }
    }
    for (let i = 1; i <= 6; ++i) { // for 6 shirt parts
        let shirtPart = newZombie.getElementsByClassName('shirt-part-' + i)[0];
        if (i === zombieDetails.shirtChoice) {
            shirtPart.classList.remove('hide');
        }
        else {
            shirtPart.classList.add('hide');
        }
    }
    let skins = newZombie.getElementsByClassName('skin');
    for (let i = 0; i < skins.length; ++i)
        skins[i].setAttribute("style", "filter:hue-rotate(" + zombieDetails.skinColorChoice + "deg)");

    let eyes = newZombie.getElementsByClassName('eye');
    for (let i = 0; i < eyes.length; ++i)
        eyes[i].setAttribute("style", "filter:hue-rotate(" + zombieDetails.eyeColorChoice + "deg)");

    let clothes = newZombie.getElementsByClassName('cloth');
    for (let i = 0; i < clothes.length; ++i)
        clothes[i].setAttribute("style", "filter:hue-rotate(" + zombieDetails.clothesColorChoice + "deg)");

    if (zombieDetails.hadhadCat) {
        newZombie.getElementsByClassName('cat-legs')[0].classList.remove('hide');
        let target = newZombie.getElementsByClassName('legs');
        for (let i = 0; i < target.length; ++i) target[i].classList.add('hide');
    }

    if (whereToAppend === 'zombieList') {
        newZombie.getElementsByClassName('zombieName')[0].value = zombieDetails.name + '\n ready:' + toYMD(zombieDetails.readyTime) + '\n level: ' + zombieDetails.level;
        newZombie.addEventListener('click', () => {
            window.location.href = "./zombieDetails.html?id=" + zombieDetails.id;
        });
    }
    else if (whereToAppend === 'zombieListOnEnemies') {
        newZombie.addEventListener('click', async () => {
            if (gSelectedZombieId === -1) {
                alert('Select Zombie');
                return;
            }
            await contract.methods.isReady(gSelectedZombieId).call({from: userAccount})
            .then( async (isReady) => {
                if(!isReady){
                    alert('This zombie is not ready');
                    return;
                }
                const estimateGas = await contract.methods.attack(gSelectedZombieId, zombieDetails.id)
                .estimateGas({from: userAccount})
                .then((gas) => {return gas;});

                console.log("estimated Gas:",estimateGas);
                await contract.methods.attack(gSelectedZombieId, zombieDetails.id)
                .send({ from: userAccount, gasLimit: estimateGas + 100000 })
                .on("transactionHash", (txHash) => {
                    alert("Txhash: " + txHash);
                })
                .on("receipt", (receipt) => {
                    console.log(receipt);
                })
                .on("error", (error) => {
                    console.log(error);
                });
            });

        })
    }
    else { // zombie is just a sample 
        newZombie.getElementsByClassName('zombieName')[0].value = zombieDetails.name;
    }
    document.getElementById(whereToAppend).appendChild(newZombie);
    model.classList.add('hide'); // model no longer needed
    return zombieDetails
}
function toYMD(strTime) {
    intTime = parseInt(strTime);
    var date = new Date();
    var d = new Date(intTime);
    var year = d.getFullYear();
    var d = new Date(intTime);
    var y = new Date(intTime * 1000);
    var year = y.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = ('0' + d.getHours()).slice(-2);
    var min = ('0' + d.getMinutes()).slice(-2);
    var sec = ('0' + d.getSeconds()).slice(-2);

    return (year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec);
}