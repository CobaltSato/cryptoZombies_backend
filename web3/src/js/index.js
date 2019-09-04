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
        for(let i = 0; i < userZombies.length; ++i){
                await contract.methods.zombies(userZombies[i]).call().
                 then((zombie) => {
                    document.getElementById('signUp').classList.add('hide');
                    document.getElementById('yourZombies').classList.remove('hide');
                    let details = calcZombieDetails(zombie, userZombies[i])
                    displayZombie(details, 'zombieList');
                });
        }
    });

    await contract.events.NewZombie({
        fromBlock: web3.eth.blockNumber
    }, async (error, event) => {
        await contract.methods.ownerOf(event.returnValues.zombieId).call().then(async (owner) => {
            if (owner === userAccount) {
                document.getElementById('signUp').classList.add('hide');
                document.getElementById('yourZombies').classList.remove('hide');
                let ret = event.returnValues;
                await contract.methods.zombies(ret.zombieId).call().then((zombie) => {
                    generateZombie(zombie,'zombieList', ret.zombieId);
                    console.log(zombie);
                });
            }
        }, false);
    })
    .on('error', console.error);
    let zombie = {
                name: "NO DATA",
                dna: "0000000000000000",
                level: -1,
                readyTime: -1,
                winCount: -1,
                lossCount: -1,
            }
   let details = calcZombieDetails(zombie);
   displayZombie(details,'preview');
   displayZombieDetailsOnPreview(details);
}


window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('metamask not found');
    }
    startApp();
})

$("#btnCreateZombie").click(async function (e) {
    var name = $("#nameInput").val()
    await contract.methods.createRandomZombie(name).send({ from: userAccount })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });
})



// detect name input at real time 
// then, display the preview of the named zombie  
//============================================================
$(function () {
    var $input = $('#nameInput');
    $input.on('input', async (event) => {
        var name = $input.val();
        // get DNA from SC
        await contract.methods.generateRandomDna(name).call().then((dna) => {
            var preview = document.getElementById('preview');
            while (preview.firstChild) preview.removeChild(preview.firstChild);

            let zombie = {
                name: name,
                dna: dna,
                level: -1,
                readyTime: -1,
                winCount: -1,
                lossCount: -1,
            }
            displayZombieDetailsOnPreview(calcZombieDetails(zombie));
            generateZombie(zombie, 'preview');
        }, false);

    });
});

function displayZombieDetailsOnPreview(zombieDetails) {
    document.getElementById('dna').textContent =
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
    
}