import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    // The create method is responsible for creating a new Pokemon.
    // It receives a CreatePokemonDto object as an argument, which contains the data needed to create the Pokemon.
    try {
      const newPoke = await this.pokemonModel.create(createPokemonDto);
      return newPoke;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(id: string): Promise<Pokemon> {
    let poke: Pokemon;

    // Si el id es un número, buscamos por el campo "no"
    if (!isNaN(+id)) {
      poke = await this.pokemonModel.findOne({ no: +id });
    }

    // Si no hemos encontrado el Pokémon por "no" y el id es válido de MongoDB, buscamos por "_id"
    if (!poke && isValidObjectId(id)) {
      poke = await this.pokemonModel.findById(id);
    }

    // Si aún no hemos encontrado el Pokémon, buscamos por "name"
    if (!poke) {
      poke = await this.pokemonModel.findOne({ name: id.toLowerCase().trim() });
    }

    // Si no se encontró el Pokémon en ninguna de las búsquedas
    if (!poke) {
      throw new BadRequestException(
        `Pokemon with identifier '${id}' not found`,
      );
    }

    return poke;
  }

  async update(
    id: string,
    updatePokemonDto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    // Esperamos a que se resuelva la búsqueda del Pokémon
    let poke = await this.findOne(id);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();
    }

    try {
      // Actualizamos el Pokémon con los datos del DTO
      poke = await this.pokemonModel.findByIdAndUpdate(id, updatePokemonDto, {
        new: true, // Devuelve el Pokémon actualizado
      });
    } catch (error) {
      this.handleExceptions(error);
    }

    return poke;
  }

  async remove(id: string) {
    // const poke = await this.findOne(id);
    // await poke.deleteOne();
    // return `${poke.name} deleted successfully`;

    // const res = await this.pokemonModel.findByIdAndDelete(id);

    // manejo del status 200 cuando en realidad no se eliminó nada para mostrar un mensaje más claro al frontend
    const res = await this.pokemonModel.deleteOne({ _id: id });
    console.log(res);
    if (res.deletedCount === 0) {
      throw new BadRequestException(
        `Pokemon with identifier '${id}' not found`,
      );
    }

    return res;
  }

  private handleExceptions(error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      throw new BadRequestException(
        `Pokemon with identifier ${error.keyValue[duplicateField]} already exists`,
      );
    } else {
      throw new InternalServerErrorException(error);
    }
  }
}
