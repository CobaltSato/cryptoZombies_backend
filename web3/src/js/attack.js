var contract;
var userAccount;
var gSelectedZombieId = -1;
var gSelectedKittyId = -1;
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
            if(userZombies.length === 0) {
                window.location.href = "./index.html";
            }
            for (let i = 0; i < userZombies.length; ++i) {
                await contract.methods.zombies(userZombies[i]).call().
                    then((zombie) => {
                        let details = calcZombieDetails(zombie, userZombies[i])
                        displayZombie(details, 'zombieListOnAttack');
                    });
            }
            var army = document.getElementsByClassName('army');
            for (let i = 0; i < army.length; ++i) { 
                army[i].addEventListener('click', () => {
                    gSelectedZombieId = userZombies[i];
                    // process check img 
                    for (let j = 0; j < army.length; ++j) { // ignore model 
                        army[j].getElementsByClassName('checkImg')[0].classList.add('hide');
                    }
                    army[i].getElementsByClassName('checkImg')[0].classList.remove('hide');
                });
            }
        });

    await contract.events.NewZombie({
        fromBlock: 0,
    }, async (error, event) => {
        await contract.methods.ownerOf(event.returnValues.zombieId).call().then(async (owner) => {
            if (owner === userAccount) {
                /*
                let ret = event.returnValues;
                await contract.methods.zombies(ret.zombieId).call().then((zombie) => {
                        let details = calcZombieDetails(zombie, ret.zombieId)
                        displayZombie(details, 'zombieListOnAttack');
                });
                */
            }
            else{
                let ret = event.returnValues;
                await contract.methods.zombies(ret.zombieId).call().then((zombie) => {
                        let details = calcZombieDetails(zombie, ret.zombieId)
                        displayZombie(details, 'zombieListOnEnemies');
                });
            }
        }, false);
    })
        .on('error', console.error);

    await contract.events.Battle({
        fromBlock: web3.eth.blockNumber
    }, async (error, event) => {
        await contract.methods.ownerOf(event.returnValues._zombieId).call().then(async (owner) => {
            if (owner === userAccount) {
                alert(event.returnValues.won? "won!" : "loss:)");
                window.location.href = "./attack.html";
            }
        }, false);
    })
        .on('error', console.error);


}


window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('metamask not found');
    }
    startApp();
})

   /*
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
    */
