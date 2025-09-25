import { forwardRef, useRef, useState, useCallback, useEffect } from 'react'
import classNames from 'classnames'
import { useConfig } from '../ConfigProvider'
import cloneDeep from 'lodash/cloneDeep'
import FileItem from './FileItem'
import Button from '../Button/Button'
import CloseButton from '../CloseButton'
import Notification from '../Notification/Notification'
import toast from '../toast/toast'
import type { CommonProps } from '../@types/common'
import type { ReactNode, ChangeEvent, MouseEvent } from 'react'

export interface UploadProps extends CommonProps {
    accept?: string
    beforeUpload?: (file: FileList | null, fileList: File[]) => boolean | string
    disabled?: boolean
    draggable?: boolean
    fileList?: File[]
    defaultFile?: { name: string; url?: string }[]
    fileListClass?: string
    fileItemClass?: string
    multiple?: boolean
    onChange?: (file: File[], fileList: File[]) => void
    onFileRemove?: (file: File[]) => void
    showList?: boolean
    tip?: string | ReactNode
    uploadLimit?: number
    field?: any
}

const filesToArray = (files: File[]) =>
    Object.keys(files).map((key) => files[key as any])

const urlToFile = async (url: string, name: string): Promise<File> => {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], name, { type: blob.type })
}

const Upload = forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
    const {
        accept,
        beforeUpload,
        disabled = false,
        draggable = false,
        fileList = [],
        defaultFile = [],
        fileListClass,
        fileItemClass,
        multiple,
        onChange,
        onFileRemove,
        showList = true,
        tip,
        uploadLimit,
        children,
        className,
        field,
        ...rest
    } = props

    const fileInputField = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>(fileList)
    const [dragOver, setDragOver] = useState(false)

    const { themeColor, primaryColorLevel } = useConfig()

    useEffect(() => {
        const initializeFiles = async () => {
            if (defaultFile.length > 0 && files.length === 0) {
                const newFiles = await Promise.all(
                    defaultFile.map(async (file) => {
                        if (file.url) {
                            try {
                                return await urlToFile(file.url, file.name)
                            } catch (error) {
                                console.error('Error loading file:', error)
                                return new File([], file.name)
                            }
                        }
                        return new File([], file.name)
                    })
                )
                setFiles(newFiles)
            }
        }

        initializeFiles()
    }, [defaultFile, files.length])

    useEffect(() => {
        if (JSON.stringify(files) !== JSON.stringify(fileList)) {
            setFiles(fileList)
        }
    }, [JSON.stringify(fileList)])

    const triggerMessage = (msg: string | ReactNode = '') => {
        toast.push(
            <Notification type="danger" duration={2000}>
                {msg || 'Upload Failed!'}
            </Notification>,
            {
                placement: 'top-center',
            },
        )
    }

    const pushFile = (newFiles: FileList | null, file: File[]) => {
        if (newFiles) {
            for (const f of newFiles) {
                file.push(f)
            }
        }
        return file
    }

    const addNewFiles = (newFiles: FileList | null) => {
        let file = cloneDeep(files)
        if (typeof uploadLimit === 'number' && uploadLimit !== 0) {
            if (Object.keys(file).length >= uploadLimit) {
                if (uploadLimit === 1) {
                    file.shift()
                    file = pushFile(newFiles, file)
                }
                return filesToArray({ ...file })
            }
        }
        file = pushFile(newFiles, file)
        return filesToArray({ ...file })
    }

    const onNewFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const { files: newFiles } = e.target
        let result: boolean | string = true

        if (beforeUpload) {
            result = beforeUpload(newFiles, files)

            if (result === false) {
                triggerMessage()
                return
            }

            if (typeof result === 'string' && result.length > 0) {
                triggerMessage(result)
                return
            }
        }

        if (result) {
            const updatedFiles = addNewFiles(newFiles)
            setFiles(updatedFiles)
            onChange?.(updatedFiles, files)
        }
    }

    const removeFile = (fileIndex: number) => {
        const deletedFileList = files.filter((_, index) => index !== fileIndex)
        setFiles(deletedFileList)
        onFileRemove?.(deletedFileList)
    }

    const triggerUpload = (e: MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
            fileInputField.current?.click()
        }
        e.stopPropagation()
    }

    const renderChildren = () => {
        if (!draggable && !children) {
            return (
                <Button disabled={disabled} onClick={(e) => e.preventDefault()}>
                    Upload
                </Button>
            )
        }

        if (draggable && !children) {
            return <span>Choose a file or drag and drop here</span>
        }

        return children
    }

    const handleDragLeave = useCallback(() => {
        if (draggable) {
            setDragOver(false)
        }
    }, [draggable])

    const handleDragOver = useCallback(() => {
        if (draggable && !disabled) {
            setDragOver(true)
        }
    }, [draggable, disabled])

    const handleDrop = useCallback(() => {
        if (draggable) {
            setDragOver(false)
        }
    }, [draggable])

    const draggableProp = {
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
    }

    const draggableEventFeedbackClass = `border-${themeColor}-${primaryColorLevel}`

    const uploadClass = classNames(
        'upload',
        draggable && `upload-draggable`,
        draggable && !disabled && `hover:${draggableEventFeedbackClass}`,
        draggable && disabled && 'disabled',
        dragOver && draggableEventFeedbackClass,
        className,
    )

    const uploadInputClass = classNames(
        'upload-input',
        draggable && `draggable`,
    )

    return (
        <>
            <div
                ref={ref}
                className={uploadClass}
                {...(draggable ? draggableProp : { onClick: triggerUpload })}
                {...rest}
            >
                <input
                    ref={fileInputField}
                    className={uploadInputClass}
                    type="file"
                    disabled={disabled}
                    multiple={multiple}
                    accept={accept}
                    title=""
                    value=""
                    onChange={onNewFileUpload}
                    {...field}
                ></input>
                {renderChildren()}
            </div>
            {tip}
            {showList && (
                <div className={classNames('upload-file-list', fileListClass)}>
                    {files.map((file, index) => (
                        <FileItem
                            key={file.name + index}
                            file={file}
                            className={fileItemClass}
                            previewUrl={file.size > 0 ? URL.createObjectURL(file) : undefined}
                        >
                            <CloseButton
                                className="upload-file-remove"
                                onClick={() => removeFile(index)}
                            />
                        </FileItem>
                    ))}
                </div>
            )}
        </>
    )
})

Upload.displayName = 'Upload'

export default Upload