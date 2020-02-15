function createCSVArray(input, separator) {
    let regexMap = {
        "comma": /,/g,
        "semicolon": /;/g,
        "pipe": /|/
    }
    let regex = regexMap[separator]
    let csvArr = input.split("\n")
    for (let i = 0; i < csvArr.length; i++) {
        csvArr[i] = csvArr[i].replace(/\n/ig, "")
        // replacing � with ä
        csvArr[i] = csvArr[i].replace(/�/g, 'ä')
        // in case of separator being something else than a comma, we have to deal with commas within columns
        if (separator != "comma") {
            csvArr[i] = csvArr[i].replace(regexMap["comma"], ".")
        }
        csvArr[i] = csvArr[i].replace(regex, ",")
        csvArr[i] = csvArr[i].trim()
        csvArr[i] = csvArr[i].split(",")

    }
    return csvArr

}


function createJSOBject(csvArr) {
    header = csvArr.splice(0, 1)[0]
    // Checking if the correct delimiter has been used
    if (header.length == 1) {
        alert("Please choose a proper delimiter for this file")
        console.log('Not a proper delimiter')
        document.getElementById('csv-file').value = "";
        return
    }

    let objArr = []
    for (let i = 0; i < csvArr.length; i++) {
        let obj = {}
        header.forEach(function (item) {
            obj[item] = csvArr[i][header.indexOf(item)]
        });
        objArr.push(obj);
    }
    if (objArr.length == 1) {
        return objArr[0]
    } else {
        return objArr
    }
}


  
function reReadFile(elem) {
    let input = document.getElementById(elem);
    input.addEventListener('change', function () {
        let file = document.getElementById('csv-file');
        if (file.files[0]) {
            readFile(file.files[0]);
            moveProgress();
            setTimeout(function () {
                headerMapper(data, 'headers-map-sum');
                headerMapper(data, 'headers-map-date');
                headerMapper(data, 'headers-map-recipient');
            }, 3000)
        } else {
            return
        }
    });

}


function convertCSV(input) {
    let delimiter = document.getElementById('delimiter').value;
    csvArr = createCSVArray(input, delimiter);
    let data = createJSOBject(csvArr);
    if (data) {   
    return data
} else {
    return 
}
}

function readFile(file) {
    let reader = new FileReader()
    reader.readAsText(file);
    let extension = file.name.split('.')[1]
    if (extension != 'csv') {
        alert('Please upload only csv files')
        document.getElementById('csv-file').value = "";
        return false
    }
    reader.onload = function (event) {
        data = convertCSV(event.target.result)
       if (data) {
        localStorage.setItem('data', JSON.stringify(data))
       return true;
        } else {
           return false
         }

    }
}   


reReadFile('delimiter');
reReadFile('date-format');



    



