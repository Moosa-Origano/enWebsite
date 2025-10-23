const perStudent = true

if (perStudent) {
    fetch(`/studentData/20${year}-${year+1}SC.csv`)
    .then((res) => res.text())
    .then((studentCSVText) => {
    const studentParsed = Papa.parse(studentCSVText,{ header:  true })
    console.log("Show student count: " , studentParsed)

    const studentFiltered = studentParsed.studentData.filter(row => wantedUniversities.includes["HE provider"]).map(row => ({
        "HE provider": row["HE provider"].replace('the', '').replace('University', '').replace('of', '').replace('College', '').replace('Science, Technology and Medicine', '').replace('The', '').trim(),  
        "Total": parseFloat(row["Total"].split(',').join('').trim())
    }))

    })
}

console.log('Show student count' , studentFiltered)
