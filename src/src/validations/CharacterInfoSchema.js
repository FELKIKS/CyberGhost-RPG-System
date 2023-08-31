import * as Yup from 'yup';

const schema = Yup.object().shape({
    name: Yup.string().required('O nome do personagem é obrigatório'),
    player_name: Yup.string().nullable(),
    age: Yup.number().nullable(),
    gender: Yup.string().nullable(),
    bio: Yup. string() .nullable(),
    lvl: Yup. string() .required('O level do personagem é obrigatório'),
});

export default schema;