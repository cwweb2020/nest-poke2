import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pokemon extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    unique: true,
    index: true,
  })
  no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

// Middleware de Mongoose para convertir el nombre a minúsculas antes de guardar
PokemonSchema.pre('save', function (next) {
  this.name = this.name.toLowerCase();
  next();
});

// para que sea un documento de mongoose, tiene que extender de Document
// nos agrega todas las funcionalidades de mongoose
