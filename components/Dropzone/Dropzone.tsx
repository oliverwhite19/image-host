import { Button } from '@mui/material';
import React, { FC } from 'react';
import DZone from 'react-dropzone';

const Dropzone: FC<{ onDrop: (acceptedFiles: any) => void }> = ({ onDrop }) => {
    return (
        <DZone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button variant="outlined">
                        Drag files here or click to select files
                    </Button>
                </div>
            )}
        </DZone>
    );
};

export { Dropzone };
