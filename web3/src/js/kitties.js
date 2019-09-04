var contract;
var userAccount;
var gSelectedZombieId = -1;
var gKittyToDna = {
    1:
        "626837621154801616088980922659877168609154386318304496692374110716999053",
    2:
        "623332824742417442073801652020554010523726975553705023219600667807529387",
    3:
        "516352335416235417056702290154738622491807922722465690508248901653769675",
    4:
        "626837514194733471931671628842075756017852396531725903999108783271194062",
    5:
        "623332880692384699892637626080736662593748365051052090218150622775425454",
    6:
        "461303548515090852312075703606893019953834813576144180229003629194229101",
    7:
        "623327769803442901710395056776552497095442687958945773589013378394108268",
    8:
        "455962002069384858370720607417168167583077581913821361519992102215692750",
    9:
        "623383377987427804185234633808849234273424454735453011726200453545178510",
}
async function startApp() {
    await web3.eth.getAccounts((error, accounts) => {
        if (accounts[0] !== userAccount) {
            userAccount = accounts[0];
        }
    })
    var accountInterval = setInterval(async () => {
        await web3.eth.getAccounts(async (error, accounts) => {
            if (accounts[0] != userAccount) {
                userAccount = accounts[0];
                window.location.href = "./index.html";
            }
        })
    }, 100);

    contract = await new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods.getZombiesByOwner(userAccount).call()
        .then(async (userZombies) => {
            if(userZombies.length === 0) {
                window.location.href = "./index.html";
            }
        });


    await contract.methods.getZombiesByOwner(userAccount).call()
        .then(async (userZombies) => {
            for (let i = 0; i < userZombies.length; ++i) {
                await contract.methods.zombies(userZombies[i]).call().
                    then((zombie) => {
                        let details = calcZombieDetails(zombie, userZombies[i])
                        displayZombie(details, 'zombieListOnFeedKitties');
                    });
            }
            var army = document.getElementsByClassName('army');
            for (let i = 1; i < army.length; ++i) { // ignore model 
                army[i].addEventListener('click', () => {
                    gSelectedZombieId = userZombies[i - 1]; // 1-idx to 0-idx 
                    // process check img 
                    for (let j = 1; j < army.length; ++j) { // ignore model 
                        army[j].getElementsByClassName('checkImg')[0].classList.add('hide');
                    }
                    army[i].getElementsByClassName('checkImg')[0].classList.remove('hide');
                });
            }
        });

        let filter = web3.eth.blockNumber;
    await contract.events.NewZombie({
        fromBlock: filter
    }, async (error, event) => {
        filter = filter + 1;
        await contract.methods.ownerOf(event.returnValues.zombieId).call().then(async (owner) => {
            if (owner === userAccount) {
                let ret = event.returnValues;
                await contract.methods.zombies(ret.zombieId).call().then((zombie) => {
                    generateZombie(zombie, 'zombieList', ret.zombieId);
                    console.log(zombie);
                });
            }
        }, false);
    })
        .on('error', console.error);


for (let ki = 1; ki <= 9; ++ki) {
    await displayKitty(gKittyToDna[ki], ki);
}
}


window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('metamask not found');
    }
    startApp();
})

async function displayKitty(kittyDna, kittyId) {
    // clone from model
    let model = document.getElementById('kittyModel');
    model.classList.remove('hide');
    let newKitty = model.cloneNode(true);
    newKitty.removeAttribute('id');

    for (let i = 1; i <= 9; ++i) { // for 9 kitties 
        let kitty = newKitty.getElementsByClassName('kitty' + i)[0];
        if (i === kittyId) {
            kitty.classList.remove('hide');
        }
        else {
            kitty.classList.add('hide');
        }
    }

    newKitty.addEventListener('click', async () => {
   if(gSelectedZombieId === -1){
       alert('Select Zombie');
       return;
   }
            await contract.methods.isReady(gSelectedZombieId).call({from: userAccount})
            .then( async (isReady) => {
                if(!isReady) {
                    alert('This zombie is not ready');
                    return;
                }
    await contract.methods.feedAndMultiply(gSelectedZombieId, kittyDna, "kitty")
    .send({ from: userAccount })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            window.location.href = "./kitties.html";
            alert('猫おいしぃ');
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });
    });
})



    document.getElementById('kittyList').appendChild(newKitty);
    model.classList.add('hide'); // model no longer needed
}
