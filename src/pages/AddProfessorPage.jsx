import React from 'react'
import { toast } from 'sonner'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAppData } from '../lib/app-context'

const initialForm = {
  name: '',
  post: '',
  experience: '',
  qualification: '',
  email: '',
  phone: '',
  image: null,
}

function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}

function validateProfessorForm(form) {
  const nextErrors = {}

  if (!form.name.trim()) {
    nextErrors.name = 'Professor name is required.'
  }

  return nextErrors
}

function buildProfessorPayload(form) {
  return {
    name: form.name.trim(),
    post: form.post.trim(),
    experience: form.experience.trim(),
    qualification: form.qualification.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    image: form.image,
  }
}

function isImageFile(file) {
  return Boolean(file?.type?.startsWith('image/'))
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read selected image file.'))
    reader.readAsDataURL(file)
  })
}

function AddProfessorPage() {
  const { addProfessor, professors } = useAppData()
  const [form, setForm] = React.useState(initialForm)
  const [errors, setErrors] = React.useState({})
  const [selectedImageName, setSelectedImageName] = React.useState('')

  const resetImageSelection = () => {
    setValue('image', null)
    setSelectedImageName('')
  }

  const setImageError = (message) => {
    setErrors((prev) => ({ ...prev, image: message }))
  }

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      resetImageSelection()
      return
    }

    if (!isImageFile(file)) {
      setImageError('Please choose a valid image file.')
      resetImageSelection()
      return
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      setValue('image', imageDataUrl)
      setSelectedImageName(file.name)
    } catch {
      setImageError('Could not read selected image file.')
      resetImageSelection()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault() ; 

    const nextErrors = validateProfessorForm(form)

    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    const payload = buildProfessorPayload(form)

    const nameKey = payload.name.trim().toLowerCase()
    const alreadyExists = professors.some(
      (professor) => professor.name.trim().toLowerCase() === nameKey,
    )

    if (alreadyExists) {
      toast.error('Professor already exists.')
      return
    }

    addProfessor(payload)
    toast.success('Professor added successfully!')
    setForm(initialForm)
    setErrors({})
    setSelectedImageName('')
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Professor</CardTitle>
            <CardDescription>Fill details below to add a professor.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="mb-2 block">
                  Professor Name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setValue('name', event.target.value)}
                  placeholder="e.g. Dr. Sarah Ahmed"
                />
                {errors.name ? <p className="mt-2 text-sm text-red-500">{errors.name}</p> : null}
              </div>

              <div>
                <Label htmlFor="post" className="mb-2 block">
                  Post
                </Label>
                <Input
                  id="post"
                  value={form.post}
                  onChange={(event) => setValue('post', event.target.value)}
                  placeholder="Assistant Professor"
                />
              </div>

              <div>
                <Label htmlFor="experience" className="mb-2 block">
                  Teaching Experience
                </Label>
                <Input
                  id="experience"
                  value={form.experience}
                  onChange={(event) => setValue('experience', event.target.value)}
                  placeholder="8 years"
                />
              </div>

              <div>
                <Label htmlFor="qualification" className="mb-2 block">
                  Educational Qualification
                </Label>
                <Input
                  id="qualification"
                  value={form.qualification}
                  onChange={(event) => setValue('qualification', event.target.value)}
                  placeholder="PhD in Computer Science"
                />
              </div>

              <div>
                <Label htmlFor="image" className="mb-2 block">
                  Profile Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {selectedImageName ? <p className="mt-2 text-xs text-(--ui-muted-text)">Selected: {selectedImageName}</p> : null}
                {errors.image ? <p className="mt-2 text-sm text-red-500">{errors.image}</p> : null}
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={(event) => setValue('email', event.target.value)}
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => setValue('phone', event.target.value)}
                  placeholder="+1 202-555-0100"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  Add Professor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AddProfessorPage
