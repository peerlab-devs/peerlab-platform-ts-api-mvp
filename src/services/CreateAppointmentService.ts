import { startOfHour } from 'date-fns';
import { getCustomRepository } from 'typeorm';

import Appointment from '../models/Appointment';
import AppointmentsRepository from '../repositories/AppointmentsRepository';

/**
 * [x] Recebe informações
 * [x] Trata erros e excessões
 * [x] Acessa respositório
 */

/** Cria interface para recebimento de dados */
interface Request {
  provider: string;
  date: Date;
}

/**
 * Dependency Inversion
 */

/** Classe para criação de appointment */
class CreateAppointmentService {
  /** Único método da classe, público, e que neste caso cria um appointment */
  public async execute({ provider, date }: Request): Promise<Appointment> {
    /** Define custom repository */
    const appointmentsRepository = getCustomRepository(AppointmentsRepository);

    /** Data do agendamento definida como início da hora */
    const appointmentDate = startOfHour(date);

    /**
     * Avalia se existe agendamento no mesmo horario enviado no corpo da
     * requisicao e retorna o primeiro appointment encontrado
     */
    const findAppointmentInSameDate = await appointmentsRepository.findByDate(
      appointmentDate,
    );

    /** Se encontrou appointment, retorna erro */
    if (findAppointmentInSameDate) {
      throw Error('This appointment is already booked');
    }

    /** Cria instância da classe de appointment */
    const appointment = appointmentsRepository.create({
      provider,
      date: appointmentDate,
    });

    /** Salva instância no banco de dados */
    await appointmentsRepository.save(appointment);

    return appointment;
  }
}

export default CreateAppointmentService;
