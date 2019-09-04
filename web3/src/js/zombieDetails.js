var query = location.search;
var gZombieId = decodeURIComponent(query.split('=')[1]);
var gCanChangeName = false;
var gCanChangeDna = false;
var gFee;
var contract;
var userAccount;
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
    await contract.methods.ownerOf(gZombieId).call().then(async (owner) => {
            if (owner === userAccount) {
                 await contract.methods.zombies(gZombieId).call().
                 then((zombie) => {
                    details = calcZombieDetails(zombie, gZombieId)
                    displayZombie(details, 'zombieList');
                    displayZombieDetailsOnPreview(details);
                });
            }
            else{
                alert("You don't have token of " + gZombieId);
            }
        }, false);

    await contract.methods.levelUpFee().call({from: userAccount}).then( (levelUpFee) =>{
        gFee = web3.utils.fromWei(levelUpFee,'ether');
        document.getElementById('fee').textContent = "levelUpFee: " + gFee;
    });

    /*
    await contract.events.Transfer({
        fromBlock: web3.eth.blockNumber
    }, (error, event) => {
        console.log(event);
        window.alert('end');
        window.location.href = "./index.html";
    })
    .on('error', console.error);
    */
}

window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('metamask not found');
    }
    startApp();
})

function displayZombieDetailsOnPreview(zombieDetails) {
    document.getElementById('dna').textContent =
        "遺伝子: " + zombieDetails.dna;
    document.getElementById('head').textContent =
        "頭部の遺伝子: " + zombieDetails.headChoice;
    document.getElementById('eyes').textContent =
        "目の遺伝子: " + zombieDetails.eyeChoice;
    document.getElementById('shirts').textContent =
        "シャツの遺伝子: " + zombieDetails.shirtChoice;
    document.getElementById('skinColor').textContent =
        "肌の色の遺伝子: " + zombieDetails.skinColorChoice;
    document.getElementById('eyesColor').textContent =
        "目の色の遺伝子: " + zombieDetails.eyeColorChoice;
    document.getElementById('clothesColor').textContent =
        "服の色の遺伝子: " + zombieDetails.clothesColorChoice;
    document.getElementById('level').textContent =
        "LV: " + zombieDetails.level;
    document.getElementById('winCount').textContent =
        "win count: " + zombieDetails.winCount;
    document.getElementById('lossCount').textContent =
        "loss count: " + zombieDetails.lossCount;
    document.getElementById('readyTime').textContent =
        "ready: " + toYMD(zombieDetails.readyTime);
    gCanChangeName = parseInt(zombieDetails.level) >= 2;
    gCanChangeDna = parseInt(zombieDetails.level) >= 20;
}

document.getElementById('btnLevelUp').addEventListener(
    'click',
    async () => {
        value = "0.001";
        await contract.methods.levelUp(gZombieId)
        .send({ from: userAccount, 
            value: web3.utils.toWei(gFee, "ether")
        })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            window.location.href = "./zombieDetails.html?" + query;
            alert('レベルアップしました:)');
        })
        .on("error", (error) => {
            console.log(error);
        });  
    }
)
document.getElementById('btnChangeName').addEventListener(
    'click',
    async () => {
        if(!gCanChangeName) {
            alert('levelが足りません;');
            return;
        }
        await contract.methods.changeName(gZombieId, $('#changeName').val())
        .send({ from: userAccount,})
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            window.location.href = "./zombieDetails.html?" + query;
            alert('名前を変更しました:)');
        })
        .on("error", (error) => {
            console.log(error);
        });
    }
)
document.getElementById('btnChangeDna').addEventListener(
    'click',
    async () => {
        if(!gCanChangeDna) {
            alert('levelが足りません;');
            return;
        }
        var inputDna = $('#changeDna').val();
        if(!inputDna.match(/^[0-9]{16}$/)){
            alert('invalid DNA');
        }
        await contract.methods.changeDna(gZombieId,inputDna)
        .send({ from: userAccount,})
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            window.location.href = "./zombieDetails.html" + query;
            alert('DNAを変更しました:)');
        })
        .on("error", (error) => {
            console.log(error);
        });
    }
)
document.getElementById('btnSend').addEventListener(
    'click',
    async () => {
        var to = $('#send').val();

        /*
        setTimeout(() =>{
            window.location.href = "./index.html";
        }
        , 10000);
        */
        await contract.methods.safeTransferFrom(userAccount, to, gZombieId)
        .send({ from: userAccount})
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
            window.alert('ゾンビを送信しました');
            window.location.href = "./index.html";
        })
        .on("receipt", (receipt) => {
            window.alert('ゾンビを送信しました');
            window.location.href = "./index.html";
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });
    }
)