import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Grid, Container, Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { PrismaClient } from '@prisma/client';

import { api } from '../../utils';

import socket from '../../utils/socket';

import {
  Header, Section, StatusBar, StatusBarPar, StatusBarSan, SheetEditableRow, StatusBarPe,

  DiceRollModal, StatusBarModal, StatusBarParModal, StatusBarSanModal, ChangePictureModal, StatusBarPeModal,
} from '../../components';

import {
  CharacterInfoForm
} from '../../components/forms';

import useModal from '../../hooks/useModal';

const prisma = new PrismaClient();

export const getServerSideProps = async ({ params }) => {
  const characterId = isNaN(params.id) ? null : Number(params.id);

  if(!characterId) {
    return {
      props: {
        character: null
      }
    }
  }

  const character = await prisma.character.findUnique({
    where: {
      id: characterId
    },
    include: {
        attributes: {
            include: {
                attribute: true
            }
        },
        skills: {
            include: {
                skill: true
            }
        }
    }
  });

  if(!character) {
    return {
      props: {
        character: null
      }
    }
  }

  const serialized = JSON.parse(JSON.stringify(character));

  return {
    props: {
      rawCharacter: serialized
    }
  }
}

function Sheet({
  classes,
  rawCharacter
}) {
  const router = useRouter();

  const refreshData = () => {
    return router.replace(router.asPath);
  }

  const [character, setCharacter] = useState(rawCharacter);

  const onCharacterInfoSubmit = async values => {
    return new Promise((resolve, reject) => {
      api.put(`/character/${character.id}`, values)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
    });
  }

  const onHitPointsModalSubmit = async newData => {
    return new Promise((resolve, reject) => {
      const data = {
        current_hit_points: Number(newData.current),
        max_hit_points: Number(newData.max)
      }

      api
        .put(`/character/${character.id}`, data)
        .then(() => {
          updateCharacterState(data);

          resolve();

          socket.emit('update_hit_points', { character_id: character.id, current: data.current_hit_points, max: data.max_hit_points });
        })
        .catch(err => {
          alert(`Erro ao atualizar a vida!`, err);

          reject();
        });
    });
  }
  const onSanPointsModalSubmit = async newData => {
    return new Promise((resolve, reject) => {
      const data = {
        current_san_points: Number(newData.current),
        max_san_points: Number(newData.max)
      }

      api
        .put(`/character/${character.id}`, data)
        .then(() => {
          updateCharacterState(data);

          resolve();

          socket.emit('update_san_points', { character_id: character.id, current: data.current_san_points, max: data.max_san_points });
        })
        .catch(err => {
          alert(`Erro ao atualizar a sanidade!`, err);

          reject();
        });
    });
  }
  const onParPointsModalSubmit = async newData => {
    return new Promise((resolve, reject) => {
      const data = {
        current_par_points: Number(newData.current),
        max_par_points: Number(newData.max)
      }

      api
        .put(`/character/${character.id}`, data)
        .then(() => {
          updateCharacterState(data);

          resolve();

          socket.emit('update_par_points', { character_id: character.id, current: data.current_par_points, max: data.max_par_points });
        })
        .catch(err => {
          alert(`Erro ao atualizar a exposição paranormal!`, err);

          reject();
        });
    });
  }

  const onPePointsModalSubmit = async newData => {
    return new Promise((resolve, reject) => {
      const data = {
        current_pe_points: Number(newData.current),
        max_pe_points: Number(newData.max)
      }

      api
        .put(`/character/${character.id}`, data)
        .then(() => {
          updateCharacterState(data);

          resolve();

          socket.emit('update_pe_points', { character_id: character.id, current: data.current_pe_points, max: data.max_pe_points });
        })
        .catch(err => {
          alert(`Erro ao atualizar os pontos de esforço!`, err);

          reject();
        });
    });
  }

  useEffect(() => {
    setCharacter(rawCharacter);
  }, [rawCharacter]);

  const updateCharacterState = data => {
    return setCharacter(prevState => ({
      ...prevState,
      ...data
    }));
  }

  const hitPointsModal = useModal(({ close }) => (
    <StatusBarModal
      type="hp"
      onSubmit={async newData => {
        onHitPointsModalSubmit(newData).then(() => close());
      }}
      handleClose={close}
      data={{
        current: character.current_hit_points,
        max: character.max_hit_points
      }}
    />
  ));
  const ParPointsModal = useModal(({ close }) => (
    <StatusBarParModal
      type="ep"
      onSubmit={async newData => {
        onParPointsModalSubmit(newData).then(() => close());
      }}
      handleClose={close}
      data={{
        current: character.current_par_points,
        max: character.max_par_points
      }}
    />
  ));

  const PePointsModal = useModal(({ close }) => (
    <StatusBarPeModal
      type="ep"
      onSubmit={async newData => {
        onPePointsModalSubmit(newData).then(() => close());
      }}
      handleClose={close}
      data={{
        current: character.current_pe_points,
        max: character.max_pe_points
      }}
    />
  ));

  const SanPointsModal = useModal(({ close }) => (
    <StatusBarSanModal
      type="sn"
      onSubmit={async newData => {
        onSanPointsModalSubmit(newData).then(() => close());
      }}
      handleClose={close}
      data={{
        current: character.current_san_points,
        max: character.max_san_points
      }}
    />
  ));
  const diceRollModal = useModal(({ close }) => (
    <DiceRollModal
      onDiceRoll={rollData => {
        const parsedData = {
          character_id: character.id,
          rolls: rollData.map(each => ({
            rolled_number: each.rolled_number,
            max_number: each.max_number
          }))
        }

        socket.emit('dice_roll', parsedData);
      }}
      handleClose={close}
      characterId={character.id}
    />
  ));

  const changePictureModal = useModal(({ close }) => (
    <ChangePictureModal
      onPictureChange={() => refreshData()}
      handleClose={close}
      character={character}
    />
  ));

  const updateCharacterAttributeValue = (attribute, value) => {
    const index = character.attributes.findIndex(a => a.attribute_id === attribute.attribute_id);

    const newArray = character.attributes;

    newArray[index] = {
      ...attribute,
      value
    }

    setCharacter(prevState => ({
      ...prevState,
      attributes: newArray
    }));
  }

  const updateCharacterSkillValue = (skill, value) => {
    const index = character.skills.findIndex(s => s.skill_id === skill.skill_id);

    const newArray = character.skills;

    newArray[index] = {
      ...skill,
      value
    }

    setCharacter(prevState => ({
      ...prevState,
      skills: newArray
    }));
  }

  const getCharacterPictureURL = () => {
    if(!character) {
      return null;
    }

    if(character.standard_character_picture_url && character.injured_character_picture_url) {
      if(character.current_hit_points > (character.max_hit_points / 2)) {
        return character.standard_character_picture_url;
      }
      else {
        return character.injured_character_picture_url;
      }
    } else {
      return `/assets/user.png`
    }
  }

  if(!rawCharacter) {
    return (
      <div>Personagem não existe!</div>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginBottom: '30px' }}>
        <Head>
          <title>Ficha de {character.name} | RPG</title>
        </Head>

        <Grid container item spacing={3}>
          <Header title={`Ficha de ${character.name}`} />

          <Grid container item xs={12} spacing={3}>
            <Grid item xs={12} md={6}>
              <Section
                title="Detalhes pessoais"
              >
                <Grid container item xs={12} spacing={3}>
                  <Grid item xs={12}>
                    <CharacterInfoForm
                      initialValues={character}
                      onSubmit={onCharacterInfoSubmit}
                    />
                  </Grid>
                </Grid>
              </Section>
            </Grid>
            <Grid item xs={12} md={6}>
              <Section>
                <Grid container item xs={12} spacing={3}>
                  <Grid item xs={6} className={classes.alignCenter}>
                    <Image
                      src={getCharacterPictureURL()}
                      alt="Character Portrait"
                      className={classes.characterImage}
                      width={140}
                      height={200}
                      onClick={() => changePictureModal.appear()}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.alignCenter}>
                    <Button
                      variant="contained"
                      onClick={() => diceRollModal.appear()}
                    >
                      ROLAR DADOS
                    </Button>
                  </Grid>
                  <Grid item xs={12} className={classes.alignCenter}>
                    <Grid container item xs={12} className={classes.bar}>
                      <Grid item xs={12} className={classes.barTitle}>
                        <span>Vida</span>
                      </Grid>
                      <Grid item xs={12}>
                        <StatusBar
                          current={character.current_hit_points}
                          max={character.max_hit_points}
                          label={`${character.current_hit_points}/${character.max_hit_points}`}
                          primaryColor="#E80A67"
                          secondaryColor="#4d0321"
                          onClick={() => {
                            hitPointsModal.appear();
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className={classes.alignCenter}>
                    <Grid container item xs={12} className={classes.bar}>
                      <Grid item xs={12} className={classes.barTitle}>
                        <span>Sanidade</span>
                      </Grid>
                      <Grid item xs={12}>
                        <StatusBarSan
                          current={character.current_san_points}
                          max={character.max_san_points}
                          label={`${character.current_san_points}/${character.max_san_points}`}
                          primaryColor="#0079c9"
                          secondaryColor="#013659"
                          onClick={() => {
                            SanPointsModal.appear();
                          }}
                        />
                        </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className={classes.alignCenter}>
                    <Grid container item xs={12} className={classes.bar}>
                      <Grid item xs={12} className={classes.barTitle}>
                        <span>Exposição Paranormal</span>
                      </Grid>
                      <Grid item xs={12}>
                        <StatusBarPar
                          current={character.current_par_points}
                          max={character.max_par_points}
                          label={`${character.current_par_points}/${character.max_par_points}`}
                          primaryColor="#9000c9"
                          secondaryColor="#2e0040"
                          onClick={() => {
                            ParPointsModal.appear();
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                      <Grid item xs={12} className={classes.alignCenter}>
                    <Grid container item xs={12} className={classes.bar}>
                      <Grid item xs={12} className={classes.barTitle}>
                        <span>Pontos de Esforço</span>
                      </Grid>
                      <Grid item xs={12}>
                        <StatusBarPe
                          current={character.current_pe_points}
                          max={character.max_pe_points}
                          label={`${character.current_pe_points}/${character.max_pe_points}`}
                          primaryColor="#e2e2e2"
                          secondaryColor="#adadad"
                          onClick={() => {
                            PePointsModal.appear();
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Section>
            </Grid>
            <Grid item xs={12} md={6}>
              <Section
                title="Atributos"
              >
                <Grid container item xs={12} spacing={3}>
                  {
                    character.attributes.map((each, index) => (
                      <Grid item xs={6} key={index}>
                        <SheetEditableRow
                          data={{
                            name: each.attribute.name,
                            value: each.value,
                            description: each.attribute.description
                          }}
                          onValueChange={newValue => {
                            api.put('/character/attribute', {
                              character_id: character.id,
                              attribute_id: each.attribute.id,
                              value: newValue
                            })
                            .catch(err => {
                              alert(`Erro ao atualizar o valor! Erro: ${err.toString()}`);
                            })
                          }}
                          onInput={newValue => {
                            updateCharacterAttributeValue(each, newValue);
                          }}
                        />
                      </Grid>
                    ))
                  }
                </Grid>
              </Section>
            </Grid>
            <Grid item xs={12} md={6}>
              <section
              title="Pericias em Acesso Rapido"
              >
                <Grid container item xs={12} spacing={3}>
                </Grid>
              </section>
            </Grid>
            <Grid item xs={12} >
              <Section
                title="Perícias"
              >
                <Grid container item xs={12} spacing={3}>
                  {
                    character.skills.map((each, index) => (
                      <Grid item xs={4} key={index}>
                        <SheetEditableRow
                          data={{
                            name: each.skill.name,
                            value: each.value,
                            description: each.skill.description
                          }}
                          onValueChange={newValue => {
                            api.put('/character/skill', {
                              character_id: character.id,
                              skill_id: each.skill.id,
                              value: newValue
                            })
                            .catch(err => {
                              alert(`Erro ao atualizar o valor! Erro: ${err.toString()}`);
                            })
                          }}
                          onInput={newValue => {
                            updateCharacterSkillValue(each, newValue);
                          }}
                        />
                      </Grid>
                    ))
                  }
                </Grid>
              </Section>
            </Grid>
            <Grid item xs={12} >
              <Section
                title="Inventário"
              >
                <Grid container item xs={12} spacing={3}>
                <TextField
                 type="number"
                 label="Dinheiro"
                 name="money"
                 value={values.money}
                 onChange={handleChange}
                 error={errors.money}
                 sx={{m: 1, width: '24ch'}}
                 InputProps={{
                   startAdornment: <InputAdornment position="start">$</InputAdornment>
                 }}
                  variant="standard"
                />
                 <IconButton color="secondary" aria-label="adicionar item">
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Section>
            </Grid>
          </Grid>
        </Grid>
      </Container>
  )
}

const styles = (theme) => ({
  characterImage: {
    width: '200px',
    borderRadius: '50%',
    cursor: 'pointer'
  },

  alignCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  bar: {
    marginBottom: '15px'
  },

  barTitle: {
    marginBottom: '10px',
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
    fontSize: '18px',
    fontWeight: 'bold'
  }
});

export default withStyles(styles)(Sheet);