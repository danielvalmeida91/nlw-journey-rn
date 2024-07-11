import { Input } from '@/components/input';
import { View, Text, Image, Keyboard, Alert } from 'react-native';
import { MapPin, Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight, AtSign } from 'lucide-react-native'

import { colors } from '@/styles/colors'
import { Button } from '@/components/button';
import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Calendar } from '@/components/calendar';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils'
import { DateData } from 'react-native-calendars';
import dayjs from 'dayjs';
import { GuestEmail } from '@/components/email';
import { validateInput } from '@/utils/validateInput';

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2
}

export default function Index() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
  const [destination, setDestination] = useState("")
  const [emailToInvite, setEmailToInvite] = useState("")
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([])

  const [showModal, setShowModal] = useState(MODAL.NONE)

  const handleNextStepForm = () => {
    if(destination.trim().length === 0 || !selectedDates.startsAt || !selectedDates.endsAt){
      return Alert.alert('Detalhes da viagem', 'Preencha todas as informações da viagem para seguir.')
    }
    if(destination.length < 4){
      return Alert.alert('Detalhes da viagem', 'O destino da viagem deve ter no mínimo  4 caracteres.')
    }
    if(stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
  }

  const  handleSelectedDate = (selectedDay:  DateData) => {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay
    })

    setSelectedDates(dates)
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailsToInvite(prevState => prevState.filter(email => email !== emailToRemove))
  }

  const handleAddEmail = () => {
    if(!validateInput.email(emailToInvite)){
      return Alert.alert('Convidade', 'E-mail inválido!')
    }

    const emailAlreadyExists = emailsToInvite.find(email => email === emailToInvite)

    if(emailAlreadyExists){
      return Alert.alert('Convidade', 'E-mail já adicionado!')
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite])
    setEmailToInvite("")
  }


  return(
    <View className='flex-1 items-center justify-center px-5'>
      <Image source={require('@/assets/logo.png')} className='h-8' resizeMode='contain' />

      <Image source={require('@/assets/bg.png')} className='absolute' />

      <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>Convide seus amigos e planeje sua{"\n"} próxima viagem</Text>
      
      <View className='w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800'>
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field 
            placeholder='Para onde ?' 
            editable={stepForm === StepForm.TRIP_DETAILS} 
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field 
            placeholder='Quando ?' 
            editable={stepForm === StepForm.TRIP_DETAILS} 
            onFocus={() => Keyboard.dismiss()} 
            showSoftInputOnFocus={false} 
            onPressIn={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)} 
            value={selectedDates.formatDatesInText}
          />
        </Input>

        { stepForm === StepForm.ADD_EMAIL && (
          <View>
            <View className='border-b py-3 border-zinc-800'>
              <Button variant='secondary' onPress={() => setStepForm(StepForm.TRIP_DETAILS)}>
                <Button.Title>Alterar local/data</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field placeholder='Quem estará na viagem?' autoCorrect={false} value={
                emailsToInvite.length > 0 ? `${emailsToInvite.length} pessoa(s) convidada(s)` : ""} onPress={() => {
                  Keyboard.dismiss()
                  setShowModal(MODAL.GUESTS)
                }}
                showSoftInputOnFocus={false}/>
            </Input>
          </View>
        )}

        <Button onPress={handleNextStepForm}>
            <Button.Title>
              {
                stepForm === StepForm.TRIP_DETAILS ? "Continuar" : "Confirmar viagem"
              }
            </Button.Title>
            <ArrowRight color={colors.lime[950]} size={20} />
          </Button>
      </View>

      <Text className='text-zinc-500 font-regular text-center text-base'>
        Ao planejar sua viagem pela plann.er você automaticamente concorda com nossos{" "} <Text className='text-zinc-300 underline'>
        termos de uso e políticas de privacidade.
        </Text>
      </Text>


      <Modal
        title='Selecionar datas'
        subtitle='Selecione a data de ide e volta da viagem'
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className='gap-4 mt-4'>
          <Calendar 
            onDayPress={handleSelectedDate}
            markedDates={selectedDates.dates}
            minDate={dayjs().toISOString()}
          />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal 
        title='Selecionar convidados'
        subtitle='Os convidades irão receber e-mails para confirmar a participação na viagem.'
        visible={showModal === MODAL.GUESTS}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View
          className='my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 it ems-start'
        >
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
          <GuestEmail email={email} key={email} onRemove={() => handleRemoveEmail(email)}  />

            ))
          ) : (
            <Text className='text-zinc-600 text-base font-regular'>
              Nenhum e-mail adicionado.
            </Text>
          )}
        </View>

        <View
          className='gap-4 mt-4'
        >
          <Input variant='secondary'>
              <AtSign color={colors.zinc[400]} size={20} />
              <Input.Field placeholder='Digite o e-mail do convidado' keyboardType='email-address' onChangeText={(text) => setEmailToInvite(text.toLowerCase())} value={emailToInvite} returnKeyType='send' onSubmitEditing={handleAddEmail} />
          </Input>
          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}