import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { saveAs } from 'file-saver';
import React, {useCallback, useMemo, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const dropzoneBaseStyle = {
    textAlign: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const dropzoneActiveStyle = {
    borderColor: '#005825',
    color: '#005825'
};

const dropzoneAcceptStyle = {
    borderColor: '#005825',
    color: '#005825'
};

const dropzoneRejectStyle = {
    borderColor: '#ff1744',
    color: '#ff1744'
};

import {find}  from "ramda"

function parseFileData({data, fileName}) {
    const phraseToSplitOn = "Time Remap\r\n\t"
    const remainingData = data.split(phraseToSplitOn)[1]
    const updatedName = `new_${fileName}`
    //
    // const lines = remainingData.split("\n")
    // console.log({lines})
    // const modifiedLines = lines.map(line => {
    //     // remove  first tab
    //
    // })
    // console.log({modifiedLines})
    // const transformedData = modifiedLines.join("\n")
    const transformedData = remainingData
    console.log({transformedData})
    return {data: transformedData, name: updatedName, oldName: fileName}
}

function UploadDropzone({
                            files = [],
                            setFiles,
                            setFilesLoading,
                        }) {
    // set default state for dropzone
    const defaultMessage = "Drag and drop files here!"
    const [message, setMessage] = useState(defaultMessage)

    // define a function that will get called when files are dropped into the dropzone
    const onDrop = useCallback((uploadedFiles) => {
        const newFiles = []

        uploadedFiles.forEach((file) => {
            const reader = new FileReader()

            // set loading state to true when the upload begins
            reader.onloadstart = () => {
                setFilesLoading(true)
            }

            // set message if upload is aborted
            reader.onabort = () => {
                setMessage("Upload Aborted")
            }

            // set message if upload errors out
            reader.onerror = () => {
                setMessage("Upload Failed")
            }

            // when data is loaded, parse it and add it to the newCustomers array
            // set the message back to default
            reader.onload = () => {
                const data = reader.result
                const fileName = file.name
                const parsedData = parseFileData({data, fileName})
                newFiles.push(parsedData)
                setMessage(defaultMessage)
            }

            // when the load has ended (either in success or failure),
            // create a new list of customers by combining the existing customers already uploaded (if any),
            // and the list of freshly parsed customer data from the file(s) you just uploaded.
            // Set the new list in state!
            reader.onloadend = () => {
                const updatedData = files.concat(newFiles)
                setFiles(updatedData)
                setFilesLoading(false)
            }

            // Instructs the FileReader to read the data as text.
            reader.readAsText(file)
        })

    }, [files, setFiles, setFilesLoading])

    // invoke the useDropzone hook and set some configuration
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({onDrop, accept: 'text/plain', maxSize: 1000000}) // 1000000 bytes = 1 megabyte


    // Logic for styling the dropzone depending on the current state
    const style = useMemo(() => ({
        ...dropzoneBaseStyle,
        ...(isDragActive ? dropzoneActiveStyle : {}),
        ...(isDragAccept ? dropzoneAcceptStyle : {}),
        ...(isDragReject ? dropzoneRejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    return (
        <Box style={style}>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography variant="h5" component="div">
                    {message}
                </Typography>
            </div>
        </Box>
    )
}


function FileDisplay({files}) {
    return (
        <div>
            {files.map(({data, name, oldName}) => {
                var file = new File([data], name, {type: "text/plain;charset=utf-8"});
                return (
                    <div key={name}>
                    <div >{`${oldName} ... ${name}`}</div>
                        <button onClick={()=>saveAs(file)}>Save file</button>
                    </div>
                )
            })}
        </div>
    )
}

export default function Home() {
    const [files, setFiles] = useState([])
    const [filesLoading, setFilesLoading] = useState(false)
    return (
        <div className={styles.container}>
            <Head>
                <title>{"Noah's Lil' Helper"}</title>
                <meta name="description" content="let's clean txt files!"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    {"Noah's Lil' Helper"}
                </h1>
                <UploadDropzone files={files} setFiles={setFiles} setFilesLoading={setFilesLoading}/>
                <FileDisplay files={files}/>
            </main>
        </div>
    )
}
