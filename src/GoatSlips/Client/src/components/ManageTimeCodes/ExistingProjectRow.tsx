import { Delete, Edit } from '@mui/icons-material';
import { Box, Button, Modal, TableCell, TableRow } from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../../constants/modalStyle';
import { codeInUse } from '../../constants/statusCodes';
import { fetchDeleteResponse } from '../../helpers/fetchFunctions';
import { ErrorDetails } from '../../types/ErrorDetails';
import classes from './ExistingProjectRow.module.scss';
import { Project } from '../../types/Project';
import { useNavigate } from 'react-router-dom';

interface ExistingProjectRowProps {
    project: Project;
    fetchProjects: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingProjectRow: React.FC<ExistingProjectRowProps> = (
    props: ExistingProjectRowProps,
) => {
    const { project, setError, setSuccess, fetchProjects } = props;

    const navigate = useNavigate();

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const deleteProject = async () => {
        const response = await fetchDeleteResponse(`Project/Delete/${project.id}`);

        if (response.ok) {
            await fetchProjects();
            setSuccess(`Successfully deleted project ${project.name}!`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    return (
        <>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/edit-project/${project.id}`)}
                    >
                        <Edit className={classes.marginRight} />
                        Manage
                    </Button>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="error"
                        onClick={() => setIsBeingDeleted(true)}
                    >
                        <Delete />
                    </Button>
                </TableCell>
            </TableRow>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete project {`"${project.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteProject()}>
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={() => setIsBeingDeleted(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};
