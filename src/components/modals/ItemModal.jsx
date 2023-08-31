import React, { useState, useEffect } from 'react';
import { withStyles } from '@mui/styles';
import {
    TextField, Dialog, DialogActions, DialogContent, Grid,
    DialogTitle, Button
} from '@mui/material'

import { api } from '../../utils';

const styles = theme => ({

})

function ItemModal({
    classes,
    handleClose,

    onSubmit,
    data,
    operation
}) {
    const [item, setitem] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if(!data) {
            return;
        }

        setitem({
            name: data.name,
            description: data.description
        });
    }, [data]);
    
    const resetState = () => {
        return setitem({
            name: '',
            description: ''
        });
    }

    const submit = () => {
        if(!item.name) {
            return;
        }

        if(operation === 'create') {
            api.post('/item', item)
                .then(() => {
                    // Callback
                    onSubmit();

                    // Close modal
                    handleClose();

                    resetState();
                })
                .catch(() => {
                    alert('Erro ao criar item!');
                });
        }
        else if (operation === 'edit') {
            api.put(`/item/${data.id}`, item)
                .then(() => {
                    // Callback
                    onSubmit();

                    // Close modal
                    handleClose();

                    resetState();
                })
                .catch(err => {
                    alert('Erro ao editar item!');
                });
        }
    }

    return (
        <Dialog
            open={true}
            onClose={handleClose}
        >
            <DialogTitle>
                {
                    operation === 'create' ? 'Criar novo item' : 'Editar item'
                }
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            style={{
                                marginTop: '15px'
                            }}
                            autoFocus
                            label="Nome"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={item.name}
                            onChange={
                                ({ target }) => {
                                    const value = target.value;

                                    setitem(prevState => ({
                                        ...prevState,
                                        name: value
                                    }));
                                }
                            }
                            spellCheck={false}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            style={{
                                marginTop: '15px'
                            }}
                            autoFocus
                            label="Descrição"
                            type="text"
                            fullWidth
                            multiline
                            variant="standard"
                            value={item.description}
                            onChange={
                                ({ target }) => {
                                    const value = target.value;

                                    setitem(prevState => ({
                                        ...prevState,
                                        description: value
                                    }));
                                }
                            }
                            spellCheck={false}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    color="secondary"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={submit}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default withStyles(styles)(ItemModal);